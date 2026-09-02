import { productController } from './products.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';
import { hasRole } from '../../plugins/role.plugin.js';

export default async function productRoutes(fastify, options) {
  // All routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Read endpoints
  fastify.get('/', productController.list);
  fastify.get('/categories', productController.getCategories);
  fastify.get('/:id', productController.getById);

  // Write endpoints: Admin & Warehouse managers
  fastify.post(
    '/',
    { preHandler: [hasRole('ADMIN', 'WAREHOUSE')] },
    productController.create
  );

  fastify.put(
    '/:id',
    { preHandler: [hasRole('ADMIN', 'WAREHOUSE')] },
    productController.update
  );

  fastify.patch(
    '/:id',
    { preHandler: [hasRole('ADMIN', 'WAREHOUSE')] },
    productController.update
  );

  fastify.delete(
    '/:id',
    { preHandler: [hasRole('ADMIN', 'WAREHOUSE')] },
    productController.delete
  );
}
