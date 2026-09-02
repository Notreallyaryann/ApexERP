import prisma from '../../config/prisma.js';
import { generateChallanPDF } from '../../utils/pdfGenerator.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const invoiceController = {
  /**
   * List all invoices (Confirmed sales challans ready for billing)
   */
  async listInvoices(request, reply) {
    try {
      const { search, page = 1, limit = 10 } = request.query;
      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {
        status: 'CONFIRMED',
      };

      if (search) {
        where.OR = [
          { challanNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { businessName: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [total, invoices] = await Promise.all([
        prisma.salesChallan.count({ where }),
        prisma.salesChallan.findMany({
          where,
          skip,
          take: parseInt(limit, 10),
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            user: { select: { id: true, name: true, role: true } },
            items: true,
          },
        }),
      ]);

      return successResponse(
        reply,
        invoices,
        'Invoices retrieved successfully.',
        200,
        {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        }
      );
    } catch (err) {
      return errorResponse(reply, err.message, err.statusCode || 500);
    }
  },

  /**
   * Download / Stream Tax Invoice PDF
   */
  async downloadInvoicePDF(request, reply) {
    try {
      const { id } = request.params;
      const challan = await prisma.salesChallan.findUnique({
        where: { id },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      if (!challan) {
        return errorResponse(reply, 'Invoice / Challan not found.', 404);
      }

      const pdfDoc = generateChallanPDF(challan, true); // isInvoice = true

      reply.header('Content-Type', 'application/pdf');
      reply.header(
        'Content-Disposition',
        `inline; filename="Invoice-${challan.challanNumber}.pdf"`
      );

      return reply.send(pdfDoc);
    } catch (err) {
      return errorResponse(reply, err.message, 500);
    }
  },

  /**
   * Download / Stream Delivery Challan PDF
   */
  async downloadChallanPDF(request, reply) {
    try {
      const { id } = request.params;
      const challan = await prisma.salesChallan.findUnique({
        where: { id },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      if (!challan) {
        return errorResponse(reply, 'Sales Challan not found.', 404);
      }

      const pdfDoc = generateChallanPDF(challan, false); // isInvoice = false

      reply.header('Content-Type', 'application/pdf');
      reply.header(
        'Content-Disposition',
        `inline; filename="Challan-${challan.challanNumber}.pdf"`
      );

      return reply.send(pdfDoc);
    } catch (err) {
      return errorResponse(reply, err.message, 500);
    }
  },
};
