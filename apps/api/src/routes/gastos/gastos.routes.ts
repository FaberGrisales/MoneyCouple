import type { FastifyInstance } from 'fastify';

export default async function gastosRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['gastos'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.post('/', { schema: { tags: ['gastos'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.get('/:id', { schema: { tags: ['gastos'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.put('/:id', { schema: { tags: ['gastos'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.delete('/:id', { schema: { tags: ['gastos'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
