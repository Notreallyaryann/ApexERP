import prisma from '../../config/prisma.js';
import { cacheService } from '../../config/redis.js';

export const dashboardService = {
  /**
   * Get aggregated operational metrics & recent activities with Redis caching
   */
  async getDashboardStats() {
    const cacheKey = 'dashboard:stats';
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return { ...cached, _fromCache: true };
    }

    // Parallel database queries
    const [
      totalCustomers,
      leadCustomers,
      activeCustomers,
      totalProducts,
      allProducts,
      totalChallans,
      confirmedChallans,
      draftChallans,
      recentMovements,
      recentChallans,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'LEAD' } }),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count(),
      prisma.product.findMany({
        select: { id: true, name: true, sku: true, currentStock: true, minStockAlert: true },
      }),
      prisma.salesChallan.count(),
      prisma.salesChallan.findMany({
        where: { status: 'CONFIRMED' },
        select: { totalAmount: true, totalQuantity: true },
      }),
      prisma.salesChallan.count({ where: { status: 'DRAFT' } }),
      prisma.stockMovement.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          user: { select: { name: true, role: true } },
        },
      }),
      prisma.salesChallan.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, businessName: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.customer.findMany({
        where: {
          status: 'LEAD',
          followUpDate: { not: null },
        },
        take: 5,
        orderBy: { followUpDate: 'asc' },
        select: {
          id: true,
          name: true,
          businessName: true,
          mobile: true,
          followUpDate: true,
        },
      }),
    ]);

    // Calculate Low Stock Products
    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStockAlert);

    // Calculate Total Revenue from Confirmed Challans
    const totalRevenue = confirmedChallans.reduce(
      (sum, c) => sum + Number(c.totalAmount || 0),
      0
    );

    const totalDispatchedQuantity = confirmedChallans.reduce(
      (sum, c) => sum + c.totalQuantity,
      0
    );

    const stats = {
      summary: {
        totalCustomers,
        activeCustomers,
        leadCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalChallans,
        confirmedChallansCount: confirmedChallans.length,
        draftChallansCount: draftChallans,
        totalRevenue,
        totalDispatchedQuantity,
      },
      lowStockItems: lowStockProducts.slice(0, 5),
      recentMovements,
      recentChallans,
      upcomingFollowUps,
      redisActive: cacheService.isAvailable(),
    };

    // Cache in Redis for 60 seconds
    await cacheService.set(cacheKey, stats, 60);

    return { ...stats, _fromCache: false };
  },
};
