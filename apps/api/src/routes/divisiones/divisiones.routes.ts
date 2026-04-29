import type { FastifyInstance } from 'fastify';

export default async function divisionesRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['divisiones'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
