import * as authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.util.js';
import User from '../models/user.model.js';

export const register = async (req, res, next) => {
  try {
    console.log('📥 Register attempt:', req.body.email);
    const { user, token } = await authService.registerUser(req.body);
    successResponse(res, 201, 'Registration successful', { user, token });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    console.log('📥 Login attempt:', req.body.email);
    const { user, token } = await authService.loginUser(req.body);
    successResponse(res, 200, 'Login successful', { user, token });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    successResponse(res, 200, 'Profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

export const searchUser = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('name email avatar role');
    if (!user) return res.status(404).json({ success: false, message: 'No user found with that email' });

    successResponse(res, 200, 'User found', { user });
  } catch (error) { next(error); }
};