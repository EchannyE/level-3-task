import User from '../models/User.model.js';
import { signToken } from '../utils/jwt.util.js';

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw createError('Email already in use', 400);

  const user = await User.create({ name, email, password, role });
  const token = signToken({ id: user._id, name: user.name, role: user.role });
  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    throw createError('Invalid email or password', 401);
  }

  const token = signToken({ id: user._id, name: user.name, role: user.role });
  return { user, token };
};

export const getProfile = (userId) => User.findById(userId);