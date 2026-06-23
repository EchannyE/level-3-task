import { verifyToken } from '../utils/jwt.util.js';
import { errorResponse } from '../utils/response.util.js';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) return errorResponse(res, 401, 'Unauthorized: Invalid or expired token');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return errorResponse(res, 401, 'Unauthorized: User not found');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};