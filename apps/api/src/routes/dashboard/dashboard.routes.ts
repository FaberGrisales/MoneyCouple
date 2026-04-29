import type { FastifyInstance } from 'fastify';

export default async function dashboardRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['dashboard'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
