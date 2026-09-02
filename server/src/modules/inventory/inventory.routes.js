import { inventoryController } from './inventory.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';
import { hasRole } from '../../plugins/role.plugin.js';

export default async function inventoryRoutes(fastify, options) {
  fastify.addHook('preHandler', authenticate);

  // Read stock movements log
  fastify.get('/movements', inventoryController.listMovements);

  // Stock adjustments: Admin and Warehouse
  fastify.post(
    '/adjust',
    { preHandler: [hasRole('ADMIN', 'WAREHOUSE')] },
    inventoryController.adjustStock
  );
}
