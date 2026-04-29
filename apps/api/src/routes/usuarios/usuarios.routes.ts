import type { FastifyInstance } from 'fastify';

export default async function usuariosRoutes(app: FastifyInstance) {
  app.get('/profile', { schema: { tags: ['usuarios'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.put('/profile', { schema: { tags: ['usuarios'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.put('/ingresos', { schema: { tags: ['usuarios'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
