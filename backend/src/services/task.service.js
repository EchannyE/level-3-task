import Task from '../models/Task.model.js';
import { getIO } from '../config/socket.js';

const populateTask = (query) =>
  query
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy',  'name email');

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const emitNotification = async (assignedToId, createdById, payload) => {
  const assigneeId = String(assignedToId);
  const creatorId  = createdById ? String(createdById) : null;

  if (assigneeId === creatorId) {
    console.log('🔔 Skipping self-notification');
    return;
  }

  const room = `user:${assigneeId}`;

  // Verify the room has connected sockets before emitting
  const io      = getIO();
  const sockets = await io.in(room).fetchSockets();
  console.log(`🔔 Emitting to ${room} — sockets in room: ${sockets.length}`);

  if (sockets.length === 0) {
    console.warn(`⚠️  No sockets in room ${room} — assignee may be offline`);
  }

  io.to(room).emit('notification', payload);
};

export const createTask = async (data) => {
  const task      = await Task.create(data);
  const populated = await populateTask(Task.findById(task._id));

  console.log(`📋 Task created: "${populated.title}" | assignedTo: ${populated.assignedTo?.name ?? 'none'}`);

  // Broadcast to project room
  getIO().to(`project:${String(data.project)}`).emit('task:created', populated);

  // Notify assignee
  if (populated.assignedTo) {
    await emitNotification(
      populated.assignedTo._id,
      populated.createdBy?._id,
      {
        type:      'TASK_ASSIGNED',
        message:   `You were assigned "${populated.title}"`,
        taskId:    String(populated._id),
        projectId: String(data.project),
      }
    );
  }

  return populated;
};

export const getProjectTasks = (projectId) =>
  populateTask(Task.find({ project: projectId })).sort('-createdAt');

export const updateTask = async (taskId, updates, projectId, updaterId) => {
  const task = await populateTask(
    Task.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true })
  );

  if (!task) throw createError('Task not found', 404);

  getIO().to(`project:${String(projectId)}`).emit('task:updated', task);

  if (task.assignedTo) {
    await emitNotification(
      task.assignedTo._id,
      updaterId,
      {
        type:      'TASK_UPDATED',
        message:   `Task "${task.title}" was updated`,
        taskId:    String(task._id),
        projectId: String(projectId),
      }
    );
  }

  return task;
};

export const deleteTask = async (taskId, projectId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw createError('Task not found', 404);
  getIO().to(`project:${String(projectId)}`).emit('task:deleted', { taskId });
  return task;
};