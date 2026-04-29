import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.',
      code: 'RATE_LIMIT_EXCEEDED',
    }),
  });
});
