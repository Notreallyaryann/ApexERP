import { customerController } from './customers.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';
import { hasRole } from '../../plugins/role.plugin.js';

export default async function customerRoutes(fastify, options) {
  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Read: Accessible by all roles (Admin, Sales, Warehouse, Accounts)
  fastify.get('/', customerController.list);
  fastify.get('/:id', customerController.getById);

  // Write: Accessible by Admin and Sales
  fastify.post(
    '/',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    customerController.create
  );

  fastify.put(
    '/:id',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    customerController.update
  );

  fastify.patch(
    '/:id',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    customerController.update
  );

  fastify.delete(
    '/:id',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    customerController.delete
  );

  fastify.post(
    '/:id/notes',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    customerController.addNote
  );
}
