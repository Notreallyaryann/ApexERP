import prisma from '../../config/prisma.js';
import { cacheService } from '../../config/redis.js';

export const inventoryService = {
  /**
   * List stock movement logs with filtering & pagination
   */
  async listMovements({ productId, movementType, search, page = 1, limit = 15 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (productId) {
      where.productId = productId;
    }

    if (movementType) {
      where.movementType = movementType;
    }

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true, currentStock: true, minStockAlert: true, location: true },
          },
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Perform manual stock adjustment (IN or OUT) in an ACID transaction
   */
  async adjustStock(userId, { productId, quantity, movementType, reason }) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      const err = new Error('Quantity must be a positive integer greater than 0.');
      err.statusCode = 400;
      throw err;
    }

    if (!['IN', 'OUT'].includes(movementType)) {
      const err = new Error("Movement type must be 'IN' or 'OUT'.");
      err.statusCode = 400;
      throw err;
    }

    if (!reason || reason.trim().length === 0) {
      const err = new Error('A valid reason for stock adjustment is required.');
      err.statusCode = 400;
      throw err;
    }

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        const err = new Error('Product not found.');
        err.statusCode = 404;
        throw err;
      }

      if (movementType === 'OUT' && product.currentStock < qty) {
        const err = new Error(
          `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${qty}`
        );
        err.statusCode = 400;
        throw err;
      }

      const newStock =
        movementType === 'IN'
          ? product.currentStock + qty
          : product.currentStock - qty;

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: qty,
          movementType,
          reason,
          userId,
        },
        include: {
          product: true,
          user: { select: { id: true, name: true, role: true } },
        },
      });

      return { movement, updatedProduct };
    });

    // Invalidate Redis dashboard cache
    await cacheService.del('dashboard:*');

    return result;
  },
};
