import { inventoryService } from './inventory.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const inventoryController = {
  async listMovements(request, reply) {
    try {
      const { productId, movementType, search, page, limit } = request.query;
      const result = await inventoryService.listMovements({
        productId,
        movementType,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 15,
      });

      return successResponse(
        reply,
        result.movements,
        'Stock movements retrieved successfully.',
        200,
        result.pagination
      );
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 500);
    }
  },

  async adjustStock(request, reply) {
    try {
      const { productId, quantity, movementType, reason } = request.body;
      if (!productId || !quantity || !movementType || !reason) {
        return errorResponse(
          reply,
          'productId, quantity, movementType, and reason are required.',
          400
        );
      }

      const result = await inventoryService.adjustStock(request.user.id, request.body);
      return successResponse(reply, result, 'Stock adjustment completed successfully.', 201);
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },
};
