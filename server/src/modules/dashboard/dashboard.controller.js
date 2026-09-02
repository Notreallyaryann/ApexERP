import { dashboardService } from './dashboard.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const dashboardController = {
  async getStats(request, reply) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return successResponse(reply, stats, 'Dashboard metrics retrieved successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, 500);
    }
  },
};
