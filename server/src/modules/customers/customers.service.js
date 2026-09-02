import prisma from '../../config/prisma.js';

export const customerService = {
  /**
   * List customers with search, status/type filters, and pagination
   */
  async listCustomers({ search, status, customerType, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { gstNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: {
              followUpNotes: true,
              challans: true,
            },
          },
        },
      }),
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get single customer by ID with detailed follow-up notes and recent challans
   */
  async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        followUpNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            challanNumber: true,
            totalQuantity: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      const err = new Error('Customer not found.');
      err.statusCode = 404;
      throw err;
    }

    return customer;
  },

  /**
   * Create a new customer
   */
  async createCustomer(data) {
    return prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType || 'WHOLESALE',
        address: data.address,
        status: data.status || 'LEAD',
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes || null,
      },
    });
  },

  /**
   * Update existing customer
   */
  async updateCustomer(id, data) {
    const updateData = { ...data };
    if (updateData.followUpDate) {
      updateData.followUpDate = new Date(updateData.followUpDate);
    }

    return prisma.customer.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Delete customer
   */
  async deleteCustomer(id) {
    return prisma.customer.delete({
      where: { id },
    });
  },

  /**
   * Add a follow-up note to customer
   */
  async addFollowUpNote(customerId, userId, { note, followUpDate, updateCustomerStatus }) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      const err = new Error('Customer not found.');
      err.statusCode = 404;
      throw err;
    }

    const createdNote = await prisma.followUpNote.create({
      data: {
        customerId,
        userId,
        note,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    // Optionally update customer's next followUpDate and status
    const customerUpdate = {};
    if (followUpDate) {
      customerUpdate.followUpDate = new Date(followUpDate);
    }
    if (updateCustomerStatus) {
      customerUpdate.status = updateCustomerStatus;
    }

    if (Object.keys(customerUpdate).length > 0) {
      await prisma.customer.update({
        where: { id: customerId },
        data: customerUpdate,
      });
    }

    return createdNote;
  },
};
