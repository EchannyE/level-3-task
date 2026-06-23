import { Router } from 'express';
import {
  createProject, getMyProjects, getProject, addMember, deleteProject,
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';
import taskRouter from './task.routes.js';
import messageRouter from './message.routes.js';

const router = Router();
router.use(protect);

// Nested resource routes → /api/projects/:projectId/tasks
router.use('/:projectId/tasks', taskRouter);
router.use('/:projectId/messages', messageRouter);

router.post('/', createProject);
router.get('/', getMyProjects);
router.get('/:id', getProject);
router.patch('/:id/members', addMember);
router.delete('/:id', restrictTo('admin'), deleteProject);

export default router;