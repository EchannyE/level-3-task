import Message from '../models/Message.model.js';

export const saveMessage = async ({ projectId, senderId, content }) => {
  const message = await Message.create({
    project: projectId,
    sender: senderId,
    content,
  });
  return message.populate('sender', 'name email avatar');
};

export const getProjectMessages = (projectId, limit = 50, page = 1) =>
  Message.find({ project: projectId })
    .populate('sender', 'name email avatar')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);