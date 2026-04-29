import type { FastifyInstance } from 'fastify';

export default async function exportsRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['exports'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
