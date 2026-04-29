import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (app: FastifyInstance) => {
  const origins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:8081').split(',');

  await app.register(cors, {
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
});
