import Project from '../models/Project.model.js';

const populate = (query) =>
  query
    .populate('owner', 'name email')
    .populate('members', 'name email avatar');

export const createProject = ({ name, description, ownerId }) =>
  Project.create({ name, description, owner: ownerId, members: [ownerId] });

export const getUserProjects = (userId) =>
  populate(Project.find({ members: userId })).sort('-createdAt');

export const getProjectById = (projectId) =>
  populate(Project.findById(projectId));

export const addMemberToProject = (projectId, userId) =>
  populate(
    Project.findByIdAndUpdate(projectId, { $addToSet: { members: userId } }, { new: true })
  );

export const deleteProject = (projectId) =>
  Project.findByIdAndDelete(projectId);