import type { FastifyInstance, FastifyRequest } from 'fastify';

export default async function metasRoutes(app: FastifyInstance) {
  // GET / — list active metas for authenticated user
  app.get(
    '/',
    {
      schema: { tags: ['metas'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id: usuarioId } = request.user;

      const metas = await app.prisma.meta.findMany({
        where: { usuarioId, estado: 'ACTIVA' },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(
        metas.map((m) => ({
          ...m,
          montoObjetivo: Number(m.montoObjetivo),
          montoActual: Number(m.montoActual),
        })),
      );
    },
  );

  // POST / — create meta
  app.post(
    '/',
    {
      schema: {
        tags: ['metas'],
        body: {
          type: 'object',
          required: ['titulo', 'tipo', 'montoObjetivo', 'fechaInicio'],
          properties: {
            titulo: { type: 'string' },
            tipo: { type: 'string' },
            montoObjetivo: { type: 'number' },
            fechaInicio: { type: 'string' },
            fechaFin: { type: 'string' },
            categoriaLimite: { type: 'string' },
            descripcion: { type: 'string' },
            icono: { type: 'string' },
            color: { type: 'string' },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (
      request: FastifyRequest<{
        Body: {
          titulo: string;
          tipo: string;
          montoObjetivo: number;
          fechaInicio: string;
          fechaFin?: string;
          categoriaLimite?: string;
          descripcion?: string;
          icono?: string;
          color?: string;
        };
      }>,
      reply,
    ) => {
      const { id: usuarioId } = request.user;
      const {
        titulo,
        tipo,
        montoObjetivo,
        fechaInicio,
        fechaFin,
        categoriaLimite,
        descripcion,
        icono,
        color,
      } = request.body;

      const meta = await app.prisma.meta.create({
        data: {
          usuarioId,
          titulo,
          tipo: tipo as never,
          montoObjetivo,
          fechaInicio: new Date(fechaInicio),
          ...(fechaFin != null && { fechaFin: new Date(fechaFin) }),
          ...(categoriaLimite != null && { categoriaLimite: categoriaLimite as never }),
          ...(descripcion != null && { descripcion }),
          ...(icono != null && { icono }),
          ...(color != null && { color }),
        },
      });

      return reply.status(201).send({
        ...meta,
        montoObjetivo: Number(meta.montoObjetivo),
        montoActual: Number(meta.montoActual),
      });
    },
  );

  // PUT /:id/contribuir — add contribution to meta
  app.put(
    '/:id/contribuir',
    {
      schema: {
        tags: ['metas'],
        body: {
          type: 'object',
          required: ['monto'],
          properties: { monto: { type: 'number' } },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string }; Body: { monto: number } }>, reply) => {
      const { id: usuarioId } = request.user;
      const { id } = request.params;
      const { monto } = request.body;

      const existing = await app.prisma.meta.findUnique({ where: { id } });
      if (!existing || existing.estado === 'CANCELADA') {
        return reply.status(404).send({ error: 'Meta no encontrada' });
      }
      if (existing.usuarioId !== usuarioId) {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }

      const newMontoActual = Number(existing.montoActual) + monto;
      const completada = newMontoActual >= Number(existing.montoObjetivo);

      const meta = await app.prisma.meta.update({
        where: { id },
        data: {
          montoActual: newMontoActual,
          ...(completada && { estado: 'COMPLETADA' }),
        },
      });

      return reply.send({
        ...meta,
        montoObjetivo: Number(meta.montoObjetivo),
        montoActual: Number(meta.montoActual),
        completada,
      });
    },
  );

  // DELETE /:id — cancel meta
  app.delete(
    '/:id',
    {
      schema: { tags: ['metas'] },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id: usuarioId } = request.user;
      const { id } = request.params;

      const existing = await app.prisma.meta.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: 'Meta no encontrada' });
      }
      if (existing.usuarioId !== usuarioId) {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }

      await app.prisma.meta.update({
        where: { id },
        data: { estado: 'CANCELADA' },
      });

      return reply.send({ success: true });
    },
  );
}
