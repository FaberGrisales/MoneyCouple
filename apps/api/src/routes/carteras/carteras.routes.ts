import type { FastifyInstance, FastifyRequest } from 'fastify';

export default async function carterasRoutes(app: FastifyInstance) {
  // GET / — list active carteras for authenticated user
  app.get(
    '/',
    {
      schema: { tags: ['carteras'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id: usuarioId } = request.user;

      const carteras = await app.prisma.cartera.findMany({
        where: { usuarioId, activa: true },
        orderBy: { createdAt: 'asc' },
      });

      return reply.send(
        carteras.map((c) => ({
          ...c,
          saldoActual: Number(c.saldoActual),
          saldoInicial: Number(c.saldoInicial),
          ...(c.limiteCredito != null && { limiteCredito: Number(c.limiteCredito) }),
        })),
      );
    },
  );

  // POST / — create cartera
  app.post(
    '/',
    {
      schema: {
        tags: ['carteras'],
        body: {
          type: 'object',
          required: ['nombre', 'tipo', 'saldoActual', 'icono', 'color'],
          properties: {
            nombre: { type: 'string' },
            tipo: { type: 'string' },
            saldoActual: { type: 'number' },
            icono: { type: 'string' },
            color: { type: 'string' },
            limiteCredito: { type: 'number' },
            diaCorte: { type: 'number' },
            diaPago: { type: 'number' },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (
      request: FastifyRequest<{
        Body: {
          nombre: string;
          tipo: string;
          saldoActual: number;
          icono: string;
          color: string;
          limiteCredito?: number;
          diaCorte?: number;
          diaPago?: number;
        };
      }>,
      reply,
    ) => {
      const { id: usuarioId } = request.user;
      const { nombre, tipo, saldoActual, icono, color, limiteCredito, diaCorte, diaPago } =
        request.body;

      const cartera = await app.prisma.cartera.create({
        data: {
          usuarioId,
          nombre,
          tipo: tipo as never,
          saldoActual,
          saldoInicial: saldoActual,
          icono,
          color,
          ...(limiteCredito != null && { limiteCredito }),
          ...(diaCorte != null && { diaCorte }),
          ...(diaPago != null && { diaPago }),
        },
      });

      return reply.status(201).send({
        ...cartera,
        saldoActual: Number(cartera.saldoActual),
        saldoInicial: Number(cartera.saldoInicial),
        ...(cartera.limiteCredito != null && { limiteCredito: Number(cartera.limiteCredito) }),
      });
    },
  );

  // PUT /:id — update cartera
  app.put(
    '/:id',
    {
      schema: { tags: ['carteras'] },
      preHandler: [app.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: {
          nombre?: string;
          tipo?: string;
          saldoActual?: number;
          icono?: string;
          color?: string;
          limiteCredito?: number;
          diaCorte?: number;
          diaPago?: number;
        };
      }>,
      reply,
    ) => {
      const { id: usuarioId } = request.user;
      const { id } = request.params;

      const existing = await app.prisma.cartera.findUnique({ where: { id } });
      if (!existing || !existing.activa) {
        return reply.status(404).send({ error: 'Cartera no encontrada' });
      }
      if (existing.usuarioId !== usuarioId) {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }

      const { nombre, tipo, saldoActual, icono, color, limiteCredito, diaCorte, diaPago } =
        request.body;

      const cartera = await app.prisma.cartera.update({
        where: { id },
        data: {
          ...(nombre != null && { nombre }),
          ...(tipo != null && { tipo: tipo as never }),
          ...(saldoActual != null && { saldoActual }),
          ...(icono != null && { icono }),
          ...(color != null && { color }),
          ...(limiteCredito != null && { limiteCredito }),
          ...(diaCorte != null && { diaCorte }),
          ...(diaPago != null && { diaPago }),
        },
      });

      return reply.send({
        ...cartera,
        saldoActual: Number(cartera.saldoActual),
        saldoInicial: Number(cartera.saldoInicial),
        ...(cartera.limiteCredito != null && { limiteCredito: Number(cartera.limiteCredito) }),
      });
    },
  );

  // DELETE /:id — deactivate cartera
  app.delete(
    '/:id',
    {
      schema: { tags: ['carteras'] },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id: usuarioId } = request.user;
      const { id } = request.params;

      const existing = await app.prisma.cartera.findUnique({ where: { id } });
      if (!existing) {
        return reply.status(404).send({ error: 'Cartera no encontrada' });
      }
      if (existing.usuarioId !== usuarioId) {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }

      await app.prisma.cartera.update({
        where: { id },
        data: { activa: false },
      });

      return reply.send({ success: true });
    },
  );
}
