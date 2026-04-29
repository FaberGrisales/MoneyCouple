import type { FastifyInstance } from 'fastify';

export default async function carterasRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['carteras'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
