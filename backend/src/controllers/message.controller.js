import * as messageService from '../services/message.service.js';
import { successResponse } from '../utils/response.util.js';
import { getIO } from '../config/socket.js';

export const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.saveMessage({
      projectId: req.params.projectId,
      senderId: req.user._id,
      content: req.body.content,
    });

    // Persist first, then broadcast — guarantees order
    getIO().to(`project:${req.params.projectId}`).emit('message:new', message);
    successResponse(res, 201, 'Message sent', { message });
  } catch (error) { next(error); }
};

export const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await messageService.getProjectMessages(
      req.params.projectId,
      +limit,
      +page
    );
    successResponse(res, 200, 'Messages retrieved', { messages });
  } catch (error) { next(error); }
};