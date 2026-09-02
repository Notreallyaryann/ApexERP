import { challanController } from './challans.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';
import { hasRole } from '../../plugins/role.plugin.js';

export default async function challanRoutes(fastify, options) {
  fastify.addHook('preHandler', authenticate);

  // Read: Accessible by all roles
  fastify.get('/', challanController.list);
  fastify.get('/:id', challanController.getById);

  // Write: Admin & Sales
  fastify.post(
    '/',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    challanController.create
  );

  fastify.post(
    '/:id/confirm',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    challanController.confirm
  );

  fastify.post(
    '/:id/cancel',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    challanController.cancel
  );

  fastify.delete(
    '/:id',
    { preHandler: [hasRole('ADMIN', 'SALES')] },
    challanController.delete
  );
}
