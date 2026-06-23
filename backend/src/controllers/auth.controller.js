import * as authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.util.js';

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