import { buildApp } from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';

async function startServer() {
  try {
    const app = await buildApp();

    // Verify DB connection
    await prisma.$connect();
    console.log('📦 Connected to PostgreSQL database.');

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚀 Mini ERP Backend Server is running at: http://${env.HOST}:${env.PORT}`);
    console.log(`📚 API Documentation (Swagger) available at: http://localhost:${env.PORT}/docs`);
    console.log(`🩺 Health Check endpoint: http://localhost:${env.PORT}/api/v1/health`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
