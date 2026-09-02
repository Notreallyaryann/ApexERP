import prisma from '../../config/prisma.js';
import { generateChallanNumber } from '../../utils/challanNumber.js';
import { cacheService } from '../../config/redis.js';

export const challanService = {
  /**
   * List challans with search, status filter, customer filter, pagination
   */
  async listChallans({ search, status, customerId, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, challans] = await Promise.all([
      prisma.salesChallan.count({ where }),
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, businessName: true, mobile: true, gstNumber: true },
          },
          user: {
            select: { id: true, name: true, role: true },
          },
          items: true,
        },
      }),
    ]);

    return {
      challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get single Challan by ID with full item snapshots and customer details
   */
  async getChallanById(id) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true, minStockAlert: true, location: true },
            },
          },
        },
      },
    });

    if (!challan) {
      const err = new Error('Sales challan not found.');
      err.statusCode = 404;
      throw err;
    }

    return challan;
  },

  /**
   * Create Sales Challan (DRAFT or CONFIRMED) with product snapshot storage
   */
  async createChallan(userId, { customerId, items, status = 'DRAFT', notes }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('A challan must contain at least one product line item.');
      err.statusCode = 400;
      throw err;
    }

    const challanNumber = await generateChallanNumber();

    // Run creation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify Customer exists
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        const err = new Error('Customer not found.');
        err.statusCode = 404;
        throw err;
      }

      // 2. Fetch and snapshot products
      const productIds = items.map((i) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      let totalQuantity = 0;
      let totalAmount = 0;
      const snapshotItems = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          const err = new Error(`Product with ID '${item.productId}' not found.`);
          err.statusCode = 400;
          throw err;
        }

        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          const err = new Error(`Invalid quantity (${item.quantity}) for product '${product.name}'.`);
          err.statusCode = 400;
          throw err;
        }

        // If creating directly as CONFIRMED, check stock availability
        if (status === 'CONFIRMED' && product.currentStock < qty) {
          const err = new Error(
            `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${qty}`
          );
          err.statusCode = 400;
          throw err;
        }

        const unitPrice = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : parseFloat(product.unitPrice);
        const lineTotal = unitPrice * qty;

        totalQuantity += qty;
        totalAmount += lineTotal;

        snapshotItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          unitPrice: unitPrice,
          quantity: qty,
          totalPrice: lineTotal,
        });
      }

      // 3. Create the Sales Challan record with snapshot line items
      const createdChallan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId,
          userId,
          status,
          totalQuantity,
          totalAmount,
          notes: notes || null,
          items: {
            create: snapshotItems,
          },
        },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      // 4. If status is CONFIRMED, atomically reduce stock & create stock movements
      if (status === 'CONFIRMED') {
        for (const item of snapshotItems) {
          // Decrement stock
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          // Log OUT movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'OUT',
              reason: `Sales Challan ${challanNumber} Dispatch Confirmation`,
              userId,
            },
          });
        }
      }

      return createdChallan;
    });

    // Invalidate Redis dashboard cache
    await cacheService.del('dashboard:*');

    return result;
  },

  /**
   * Confirm an existing DRAFT Challan
   */
  async confirmChallan(id, userId) {
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: true },
          },
          customer: true,
        },
      });

      if (!challan) {
        const err = new Error('Sales Challan not found.');
        err.statusCode = 404;
        throw err;
      }

      if (challan.status === 'CONFIRMED') {
        const err = new Error('This challan is already confirmed.');
        err.statusCode = 400;
        throw err;
      }

      if (challan.status === 'CANCELLED') {
        const err = new Error('A cancelled challan cannot be confirmed.');
        err.statusCode = 400;
        throw err;
      }

      // Check stock sufficiency for all line items
      for (const item of challan.items) {
        const currentProduct = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!currentProduct) {
          const err = new Error(`Product '${item.productName}' no longer exists in inventory.`);
          err.statusCode = 400;
          throw err;
        }

        if (currentProduct.currentStock < item.quantity) {
          const err = new Error(
            `Insufficient stock for '${item.productName}' (SKU: ${item.productSku}). Available: ${currentProduct.currentStock}, Requested: ${item.quantity}`
          );
          err.statusCode = 400;
          throw err;
        }
      }

      // Reduce stock and log movements
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan ${challan.challanNumber} Confirmation`,
            userId,
          },
        });
      }

      // Update status to CONFIRMED
      const confirmed = await tx.salesChallan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      return confirmed;
    });

    await cacheService.del('dashboard:*');
    return result;
  },

  /**
   * Cancel a Challan (Restores stock if it was previously confirmed)
   */
  async cancelChallan(id, userId, reason = 'Cancelled by user') {
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: {
          items: true,
          customer: true,
        },
      });

      if (!challan) {
        const err = new Error('Sales Challan not found.');
        err.statusCode = 404;
        throw err;
      }

      if (challan.status === 'CANCELLED') {
        const err = new Error('Challan is already cancelled.');
        err.statusCode = 400;
        throw err;
      }

      // If it was confirmed, restore inventory stock and log IN movement
      if (challan.status === 'CONFIRMED') {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'IN',
              reason: `Stock restored from Cancelled Challan ${challan.challanNumber} (${reason})`,
              userId,
            },
          });
        }
      }

      const cancelled = await tx.salesChallan.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: challan.notes ? `${challan.notes} [Cancelled: ${reason}]` : `Cancelled: ${reason}`,
        },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      return cancelled;
    });

    await cacheService.del('dashboard:*');
    return result;
  },

  /**
   * Delete Draft Challan
   */
  async deleteChallan(id) {
    const challan = await prisma.salesChallan.findUnique({ where: { id } });
    if (!challan) {
      const err = new Error('Challan not found.');
      err.statusCode = 404;
      throw err;
    }

    if (challan.status === 'CONFIRMED') {
      const err = new Error('Confirmed challans cannot be deleted. You may cancel them instead.');
      err.statusCode = 400;
      throw err;
    }

    await prisma.challanItem.deleteMany({ where: { challanId: id } });
    await prisma.salesChallan.delete({ where: { id } });

    await cacheService.del('dashboard:*');
    return null;
  },
};
