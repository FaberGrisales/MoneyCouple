import type { FastifyInstance } from 'fastify';

export default async function parejasRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['parejas'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
