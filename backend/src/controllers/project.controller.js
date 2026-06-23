import * as projectService from '../services/project.service.js';
import { successResponse } from '../utils/response.util.js';

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject({ ...req.body, ownerId: req.user._id });
    successResponse(res, 201, 'Project created', { project });
  } catch (error) { next(error); }
};

export const getMyProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getUserProjects(req.user._id);
    successResponse(res, 200, 'Projects retrieved', { projects });
  } catch (error) { next(error); }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    successResponse(res, 200, 'Project retrieved', { project });
  } catch (error) { next(error); }
};

export const addMember = async (req, res, next) => {
  try {
    const project = await projectService.addMemberToProject(req.params.id, req.body.userId);
    successResponse(res, 200, 'Member added', { project });
  } catch (error) { next(error); }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    successResponse(res, 200, 'Project deleted', {});
  } catch (error) { next(error); }
};