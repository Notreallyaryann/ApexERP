import { authController } from './auth.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';
import { hasRole } from '../../plugins/role.plugin.js';

export default async function authRoutes(fastify, options) {
  // Public routes
  fastify.post('/login', authController.login);
  fastify.post('/register', authController.register);
  fastify.post('/sync', authController.syncSupabase);

  // Authenticated routes
  fastify.get('/me', { preHandler: [authenticate] }, authController.getMe);

  // Admin only routes
  fastify.get(
    '/users',
    { preHandler: [authenticate, hasRole('ADMIN')] },
    authController.listUsers
  );

  fastify.patch(
    '/users/:id/role',
    { preHandler: [authenticate, hasRole('ADMIN')] },
    authController.updateRole
  );
}
