import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env } from './config/env.js';
import { setupErrorHandler } from './plugins/errorHandler.js';

// Modular routes
import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customers/customers.routes.js';
import productRoutes from './modules/products/products.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import challanRoutes from './modules/challans/challans.routes.js';
import invoiceRoutes from './modules/invoices/invoices.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: env.NODE_ENV === 'development' ? { level: 'info' } : true,
  });

  // 1. Plugins
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : [env.CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await fastify.register(sensible);

  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
  });

  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  // 2. Swagger / OpenAPI Documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Mini ERP + CRM Operations Portal API',
        description: 'REST API documentation for Wholesale ERP/CRM with Supabase Auth, PostgreSQL (Prisma), Redis, S3, and PDF engine.',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development Server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // 3. Global Error Handler
  setupErrorHandler(fastify);

  // 4. Health Check Endpoint
  fastify.get('/api/v1/health', async (request, reply) => {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Mini ERP + CRM Operations API',
      version: '1.0.0',
    };
  });

  // 5. Register Feature Modules with /api/v1 prefix
  fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  fastify.register(customerRoutes, { prefix: '/api/v1/customers' });
  fastify.register(productRoutes, { prefix: '/api/v1/products' });
  fastify.register(inventoryRoutes, { prefix: '/api/v1/inventory' });
  fastify.register(challanRoutes, { prefix: '/api/v1/challans' });
  fastify.register(invoiceRoutes, { prefix: '/api/v1/invoices' });
  fastify.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
  fastify.register(uploadRoutes, { prefix: '/api/v1/upload' });

  return fastify;
}
