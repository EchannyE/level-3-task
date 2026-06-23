import * as taskService from '../services/task.service.js';
import { successResponse } from '../utils/response.util.js';

import {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
  emitNotification,
} from '../config/socket.js';

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
      project: req.params.projectId,
      createdBy: req.user._id,
    });

    emitTaskCreated(req.params.projectId, task);

    if (task.assignedTo) {
      emitNotification(task.assignedTo.toString(), {
        type: 'TASK_ASSIGNED',
        message: `You were assigned "${task.title}"`,
      });
    }

    successResponse(res, 201, 'Task created', { task });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getProjectTasks(
      req.params.projectId
    );

    successResponse(res, 200, 'Tasks retrieved', {
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.params.projectId,
      req.user._id
    );

    emitTaskUpdated(req.params.projectId, task);

    successResponse(res, 200, 'Task updated', {
      task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(
      req.params.id,
      req.params.projectId
    );

    emitTaskDeleted(
      req.params.projectId,
      req.params.id
    );

    successResponse(res, 200, 'Task deleted', {});
  } catch (error) {
    next(error);
  }
};