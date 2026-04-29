import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fp(async (app: FastifyInstance) => {
  const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

  try {
    await redis.connect();
    app.decorate('redis', redis);
    app.addHook('onClose', async () => redis.quit());
  } catch {
    app.log.warn('Redis connection failed — caching disabled');
    app.decorate('redis', redis);
  }
});
