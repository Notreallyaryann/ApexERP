import { errorResponse } from '../utils/apiResponse.js';

export function setupErrorHandler(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // Fastify Schema Validation Error
    if (error.validation) {
      return errorResponse(
        reply,
        'Invalid request data or parameters',
        400,
        error.validation.map((v) => ({
          field: v.instancePath || v.params?.missingProperty || 'field',
          message: v.message,
        }))
      );
    }

    // Prisma Unique Constraint Error (P2002)
    if (error.code === 'P2002') {
      const target = error.meta?.target ? error.meta.target.join(', ') : 'field';
      return errorResponse(reply, `A record with this ${target} already exists.`, 409);
    }

    // Prisma Not Found (P2025)
    if (error.code === 'P2025') {
      return errorResponse(reply, 'The requested record was not found.', 404);
    }

    // Custom or standard HTTP status errors
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error occurred.';

    return errorResponse(reply, message, statusCode);
  });
}
