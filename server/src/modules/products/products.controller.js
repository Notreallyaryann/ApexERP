import { productService } from './products.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const productController = {
  async list(request, reply) {
    try {
      const { search, category, lowStockOnly, page, limit } = request.query;
      const result = await productService.listProducts({
        search,
        category,
        lowStockOnly,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      return successResponse(
        reply,
        result.products,
        'Products retrieved successfully.',
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
      const product = await productService.getProductById(id);
      return successResponse(reply, product, 'Product retrieved successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 404);
    }
  },

  async create(request, reply) {
    try {
      const { name, sku, category, unitPrice } = request.body;
      if (!name || !sku || !category || unitPrice === undefined) {
        return errorResponse(
          reply,
          'Name, SKU, category, and unitPrice are required.',
          400
        );
      }

      const newProduct = await productService.createProduct(request.body, request.user.id);
      return successResponse(reply, newProduct, 'Product created successfully.', 201);
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async update(request, reply) {
    try {
      const { id } = request.params;
      const updated = await productService.updateProduct(id, request.body);
      return successResponse(reply, updated, 'Product updated successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async delete(request, reply) {
    try {
      const { id } = request.params;
      await productService.deleteProduct(id);
      return successResponse(reply, null, 'Product deleted successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 400);
    }
  },

  async getCategories(request, reply) {
    try {
      const categories = await productService.getCategories();
      return successResponse(reply, categories, 'Categories retrieved successfully.');
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 500);
    }
  },
};
