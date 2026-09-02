import prisma from '../../config/prisma.js';
import { cacheService } from '../../config/redis.js';

export const productService = {
  /**
   * List products with search, category filter, low stock filter, and pagination
   */
  async listProducts({ search, category, lowStockOnly, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // Prisma query for low stock: currentStock <= minStockAlert
    // Since Prisma raw comparison can also be handled, if lowStockOnly is true:
    let products, total;

    if (lowStockOnly === true || lowStockOnly === 'true') {
      // Get all matching search/category first, then filter or use raw query
      const allMatching = await prisma.product.findMany({
        where,
        orderBy: { currentStock: 'asc' },
        include: {
          _count: {
            select: { stockMovements: true, challanItems: true },
          },
        },
      });

      const lowStockProducts = allMatching.filter((p) => p.currentStock <= p.minStockAlert);
      total = lowStockProducts.length;
      products = lowStockProducts.slice(skip, skip + limit);
    } else {
      [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { stockMovements: true, challanItems: true },
            },
          },
        }),
      ]);
    }

    // Annotate products with isLowStock flag
    const mappedProducts = products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minStockAlert,
    }));

    return {
      products: mappedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get single product by ID with stock movement history
   */
  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minStockAlert,
    };
  },

  /**
   * Create a new product
   */
  async createProduct(data, userId) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku.trim().toUpperCase() },
    });

    if (existingSku) {
      const err = new Error(`Product with SKU '${data.sku}' already exists.`);
      err.statusCode = 409;
      throw err;
    }

    const initialStock = data.currentStock ? parseInt(data.currentStock, 10) : 0;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku.trim().toUpperCase(),
        category: data.category,
        unitPrice: parseFloat(data.unitPrice),
        currentStock: initialStock,
        minStockAlert: data.minStockAlert ? parseInt(data.minStockAlert, 10) : 10,
        location: data.location || 'Main Warehouse',
        imageUrl: data.imageUrl || null,
      },
    });

    // If initial stock is provided, log an initial IN movement
    if (initialStock > 0 && userId) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantity: initialStock,
          movementType: 'IN',
          reason: 'Initial Product Stocking',
          userId: userId,
        },
      });
    }

    // Invalidate dashboard/inventory cache
    await cacheService.del('dashboard:*');

    return product;
  },

  /**
   * Update existing product
   */
  async updateProduct(id, data) {
    const updatePayload = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.unitPrice !== undefined) updatePayload.unitPrice = parseFloat(data.unitPrice);
    if (data.minStockAlert !== undefined) updatePayload.minStockAlert = parseInt(data.minStockAlert, 10);
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;

    if (data.sku) {
      const skuFormatted = data.sku.trim().toUpperCase();
      const existing = await prisma.product.findFirst({
        where: {
          sku: skuFormatted,
          NOT: { id },
        },
      });
      if (existing) {
        const err = new Error(`SKU '${skuFormatted}' is already in use by another product.`);
        err.statusCode = 409;
        throw err;
      }
      updatePayload.sku = skuFormatted;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updatePayload,
    });

    await cacheService.del('dashboard:*');
    return updated;
  },

  /**
   * Delete product
   */
  async deleteProduct(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { challanItems: true, stockMovements: true },
        },
      },
    });

    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }

    if (product._count.challanItems > 0) {
      const err = new Error('Cannot delete product because it is referenced in sales challans.');
      err.statusCode = 400;
      throw err;
    }

    // Delete stock movements then product
    await prisma.stockMovement.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    await cacheService.del('dashboard:*');
    return null;
  },

  /**
   * Get distinct categories
   */
  async getCategories() {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return products.map((p) => p.category);
  },
};
