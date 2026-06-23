import Task from '../models/Task.model.js';
import { getIO } from '../config/socket.js';

const populateTask = (query) =>
  query
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email');

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

export const createTask = async (data) => {
  const task = await (await Task.create(data)).populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email' },
  ]);

  // Broadcast new task to all project members in real-time
  getIO().to(`project:${data.project}`).emit('task:created', task);
  return task;
};

export const getProjectTasks = (projectId) =>
  populateTask(Task.find({ project: projectId })).sort('-createdAt');

export const updateTask = async (taskId, updates, projectId) => {
  const task = await populateTask(
    Task.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true })
  );

  if (!task) throw createError('Task not found', 404);

  // Broadcast update to project room
  getIO().to(`project:${projectId}`).emit('task:updated', task);

  // Send targeted notification to assigned user if different from updater
  if (task.assignedTo) {
    getIO().to(`user:${task.assignedTo._id}`).emit('notification', {
      type: 'TASK_UPDATED',
      message: `Task "${task.title}" was updated`,
      taskId: task._id,
      projectId,
    });
  }

  return task;
};

export const deleteTask = async (taskId, projectId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw createError('Task not found', 404);

  getIO().to(`project:${projectId}`).emit('task:deleted', { taskId });
  return task;
};