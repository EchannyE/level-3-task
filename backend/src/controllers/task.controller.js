import * as taskService from '../services/task.service.js';
import { successResponse } from '../utils/response.util.js';

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
      project: req.params.projectId,
      createdBy: req.user._id,
    });
    successResponse(res, 201, 'Task created', { task });
  } catch (error) { next(error); }
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getProjectTasks(req.params.projectId);
    successResponse(res, 200, 'Tasks retrieved', { tasks });
  } catch (error) { next(error); }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.params.projectId
    );
    successResponse(res, 200, 'Task updated', { task });
  } catch (error) { next(error); }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.params.projectId);
    successResponse(res, 200, 'Task deleted', {});
  } catch (error) { next(error); }
};