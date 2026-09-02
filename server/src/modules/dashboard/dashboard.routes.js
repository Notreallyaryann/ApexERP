import { dashboardController } from './dashboard.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';

export default async function dashboardRoutes(fastify, options) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/stats', dashboardController.getStats);
}
