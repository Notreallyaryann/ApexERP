import { challanService } from './challans.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const challanController = {
  async list(request, reply) {
    try {
      const { search, status, customerId, page, limit } = request.query;
      const result = await challanService.listChallans({
        search,
        status,
        customerId,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      return successResponse(
        reply,
        result.challans,
        'Sales challans retrieved successfully.',
        200,
        result.pagination
      );
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 500);
    }
  },

  async getById(request, reply) {
    try {
      const { id } = request.params;
      const challan = await challanService.getChallanById(id);
      return successResponse(reply, challan, 'Sales challan details retrieved.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 404);
    }
  },

  async create(request, reply) {
    try {
      const { customerId, items, status, notes } = request.body;
      if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return errorResponse(
          reply,
          'customerId and at least one item are required.',
          400
        );
      }

      const challan = await challanService.createChallan(request.user.id, {
        customerId,
        items,
        status: status || 'DRAFT',
        notes,
      });

      return successResponse(reply, challan, 'Sales challan created successfully.', 201);
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async confirm(request, reply) {
    try {
      const { id } = request.params;
      const confirmed = await challanService.confirmChallan(id, request.user.id);
      return successResponse(
        reply,
        confirmed,
        `Challan ${confirmed.challanNumber} confirmed and inventory updated successfully.`
      );
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async cancel(request, reply) {
    try {
      const { id } = request.params;
      const { reason } = request.body || {};
      const cancelled = await challanService.cancelChallan(id, request.user.id, reason);
      return successResponse(
        reply,
        cancelled,
        `Challan ${cancelled.challanNumber} cancelled successfully.`
      );
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async delete(request, reply) {
    try {
      const { id } = request.params;
      await challanService.deleteChallan(id);
      return successResponse(reply, null, 'Draft challan deleted successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },
};
