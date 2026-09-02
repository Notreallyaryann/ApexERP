import { customerService } from './customers.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const customerController = {
  async list(request, reply) {
    try {
      const { search, status, customerType, page, limit } = request.query;
      const result = await customerService.listCustomers({
        search,
        status,
        customerType,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      return successResponse(
        reply,
        result.customers,
        'Customers retrieved successfully.',
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
      const customer = await customerService.getCustomerById(id);
      return successResponse(reply, customer, 'Customer details retrieved.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 404);
    }
  },

  async create(request, reply) {
    try {
      const { name, mobile, businessName, address } = request.body;
      if (!name || !mobile || !businessName || !address) {
        return errorResponse(
          reply,
          'Name, mobile, businessName, and address are required.',
          400
        );
      }

      const newCustomer = await customerService.createCustomer(request.body);
      return successResponse(reply, newCustomer, 'Customer created successfully.', 201);
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async update(request, reply) {
    try {
      const { id } = request.params;
      const updated = await customerService.updateCustomer(id, request.body);
      return successResponse(reply, updated, 'Customer updated successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async delete(request, reply) {
    try {
      const { id } = request.params;
      await customerService.deleteCustomer(id);
      return successResponse(reply, null, 'Customer deleted successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async addNote(request, reply) {
    try {
      const { id } = request.params;
      const { note, followUpDate, updateCustomerStatus } = request.body;
      if (!note) {
        return errorResponse(reply, 'Note content is required.', 400);
      }

      const createdNote = await customerService.addFollowUpNote(id, request.user.id, {
        note,
        followUpDate,
        updateCustomerStatus,
      });

      return successResponse(reply, createdNote, 'Follow-up note added successfully.', 201);
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },
};
