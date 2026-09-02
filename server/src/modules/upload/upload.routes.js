import { uploadController } from './upload.controller.js';
import { authenticate } from '../../plugins/auth.plugin.js';
import { hasRole } from '../../plugins/role.plugin.js';

export default async function uploadRoutes(fastify, options) {
  fastify.addHook('preHandler', authenticate);

  fastify.post(
    '/image',
    { preHandler: [hasRole('ADMIN', 'WAREHOUSE')] },
    uploadController.uploadProductImage
  );
}
