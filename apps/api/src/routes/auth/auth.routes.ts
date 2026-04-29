import type { FastifyInstance } from 'fastify';

export default async function authRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    {
      schema: {
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password', 'nombre'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      return reply.status(501).send({ success: false, error: 'Por implementar' });
    },
  );

  app.post(
    '/login',
    {
      schema: { tags: ['auth'] },
    },
    async (request, reply) => {
      return reply.status(501).send({ success: false, error: 'Por implementar' });
    },
  );

  app.post('/logout', { schema: { tags: ['auth'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.post('/refresh', { schema: { tags: ['auth'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });

  app.get('/me', { schema: { tags: ['auth'] } }, async (_, reply) => {
    return reply.status(501).send({ success: false, error: 'Por implementar' });
  });
}
