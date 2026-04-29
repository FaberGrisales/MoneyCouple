import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (app: FastifyInstance) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'MoneyCouple API',
        description: 'API for MoneyCouple — personal & couples expense tracking with AI',
        version: '1.0.0',
      },
      servers: [{ url: process.env['API_URL'] ?? 'http://localhost:3000' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  });
});
