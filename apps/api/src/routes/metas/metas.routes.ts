import type { FastifyInstance } from 'fastify';

export default async function metasRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['metas'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
