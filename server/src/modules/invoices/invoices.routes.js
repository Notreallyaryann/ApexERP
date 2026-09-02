import { invoiceController } from './invoices.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';

export default async function invoiceRoutes(fastify, options) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', invoiceController.listInvoices);
  fastify.get('/:id/pdf', invoiceController.downloadInvoicePDF);
  fastify.get('/:id/challan-pdf', invoiceController.downloadChallanPDF);
}
