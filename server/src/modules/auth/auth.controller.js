import { authService } from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const authController = {
  async login(request, reply) {
    const { email, password } = request.body;
    if (!email || !password) {
      return errorResponse(reply, 'Email and password are required.', 400);
    }

    try {
      const result = await authService.login(email, password);
      return successResponse(reply, result, 'Login successful.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 401);
    }
  },

  async register(request, reply) {
    const { name, email, password, role } = request.body;
    if (!name || !email || !password) {
      return errorResponse(reply, 'Name, email, and password are required.', 400);
    }

    try {
      const result = await authService.register(name, email, password, role);
      return successResponse(reply, result, 'User registered successfully.', 201);
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async syncSupabase(request, reply) {
    const { supabaseToken } = request.body;
    if (!supabaseToken) {
      return errorResponse(reply, 'supabaseToken is required.', 400);
    }

    try {
      const result = await authService.syncSupabaseUser(supabaseToken);
      return successResponse(reply, result, 'Supabase user synchronized successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async getMe(request, reply) {
    try {
      const user = await authService.getUserById(request.user.id);
      return successResponse(reply, user, 'User profile retrieved.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 404);
    }
  },

  async listUsers(request, reply) {
    try {
      const users = await authService.getAllUsers();
      return successResponse(reply, users, 'Users retrieved successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 500);
    }
  },

  async updateRole(request, reply) {
    const { id } = request.params;
    const { role } = request.body;
    if (!role) {
      return errorResponse(reply, 'Role is required.', 400);
    }

    try {
      const updated = await authService.updateUserRole(id, role);
      return successResponse(reply, updated, 'User role updated successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },
};
