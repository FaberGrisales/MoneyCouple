import type { FastifyInstance, FastifyRequest } from 'fastify';

export default async function gastosRoutes(app: FastifyInstance) {
  // GET / — list gastos for authenticated user
  app.get(
    '/',
    {
      schema: { tags: ['gastos'] },
      preHandler: [app.authenticate],
    },
    async (
      request: FastifyRequest<{
        Querystring: { mes?: string; categoria?: string; carteraId?: string };
      }>,
      reply,
    ) => {
      const { id: usuarioId } = request.user;
      const { mes, categoria, carteraId } = request.query;

      // Determine month range
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1;

      if (mes) {
        const parts = mes.split('-');
        year = parseInt(parts[0] ?? String(year), 10);
        month = parseInt(parts[1] ?? String(month), 10);
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const gastos = await app.prisma.gasto.findMany({
        where: {
          usuarioId,
          deletedAt: null,
          fechaGasto: { gte: startDate, lt: endDate },
          ...(categoria != null && { categoria: categoria as never }),
          ...(carteraId != null && { carteraId }),
        },
        orderBy: { fechaGasto: 'desc' },
      });

      const total = gastos.reduce((sum, g) => sum + Number(g.monto), 0);

      return reply.send({
        gastos: gastos.map((g) => ({ ...g, monto: Number(g.monto) })),
        total,
        count: gastos.length,
      });
    },
  );

  // POST / — create gasto
  app.post(
    '/',
    {
      schema: {
        tags: ['gastos'],
        body: {
          type: 'object',
          required: ['monto', 'categoria', 'fechaGasto'],
          properties: {
            monto: { type: 'number' },
            descripcion: { type: 'string' },
            categoria: { type: 'string' },
            establecimiento: { type: 'string' },
            fechaGasto: { type: 'string' },
            tipoGasto: { type: 'string' },
            carteraId: { type: 'string' },
            esCompartido: { type: 'boolean' },
            notas: { type: 'string' },
            etiquetas: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (
      request: FastifyRequest<{
        Body: {
          monto: number;
          descripcion?: string;
          categoria: string;
          establecimiento?: string;
          fechaGasto: string;
          tipoGasto?: string;
          carteraId?: string;
          esCompartido?: boolean;
          notas?: string;
          etiquetas?: string[];
        };
      }>,
      reply,
    ) => {
      const { id: usuarioId } = request.user;
      const {
        monto,
        descripcion,
        categoria,
        establecimiento,
        fechaGasto,
        tipoGasto,
        carteraId,
        esCompartido,
        notas,
        etiquetas,
      } = request.body;

      // Auto-set parejaId when gasto is shared
      let autoParejaId: string | undefined;
      if (esCompartido) {
        const userRecord = await app.prisma.user.findUnique({
          where: { id: usuarioId },
          select: { parejaId: true },
        });
        if (userRecord?.parejaId) {
          autoParejaId = userRecord.parejaId;
        }
      }

      const gasto = await app.prisma.gasto.create({
        data: {
          usuarioId,
          monto,
          categoria: categoria as never,
          fuenteRegistro: 'MANUAL',
          fechaGasto: new Date(fechaGasto),
          ...(descripcion != null && { descripcion }),
          ...(establecimiento != null && { establecimiento }),
          ...(tipoGasto != null && { tipoGasto: tipoGasto as never }),
          ...(carteraId != null && { carteraId }),
          ...(esCompartido != null && { esCompartido }),
          ...(autoParejaId != null && { parejaId: autoParejaId }),
          ...(notas != null && { notas }),
          ...(etiquetas != null && { etiquetas }),
        },
      });

      return reply.status(201).send({ ...gasto, monto: Number(gasto.monto) });
    },
  );

  // GET /:id — get one gasto
  app.get(
    '/:id',
    {
      schema: { tags: ['gastos'] },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id: usuarioId } = request.user;
      const { id } = request.params;

      const gasto = await app.prisma.gasto.findUnique({ where: { id } });

      if (!gasto || gasto.deletedAt) {
        return reply.status(404).send({ error: 'Gasto no encontrado' });
      }

      if (gasto.usuarioId !== usuarioId) {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }

      return reply.send({ ...gasto, monto: Number(gasto.monto) });
    },
  );

  // PUT /:id — update gasto
  app.put(
    '/:id',
    {
      schema: { tags: ['gastos'] },
      preHandler: [app.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: {
          monto?: number;
          descripcion?: string;
          categoria?: string;
          establecimiento?: string;
          fechaGasto?: string;
          tipoGasto?: string;
          carteraId?: string;
          esCompartido?: boolean;
          notas?: string;
          etiquetas?: string[];
        };
      }>,
      reply,
    ) => {
      const { id: usuarioId } = request.user;
      const { id } = request.params;

      const existing = await app.prisma.gasto.findUnique({ where: { id } });

      if (!existing || existing.deletedAt) {
        return reply.status(404).send({ error: 'Gasto no encontrado' });
      }

      if (existing.usuarioId !== usuarioId) {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }

      const {
        monto,
        descripcion,
        categoria,
        establecimiento,
        fechaGasto,
        tipoGasto,
        carteraId,
        esCompartido,
        notas,
        etiquetas,
      } = request.body;

      const gasto = await app.prisma.gasto.update({
        where: { id },
        data: {
          ...(monto != null && { monto }),
          ...(descripcion != null && { descripcion }),
          ...(categoria != null && { categoria: categoria as never }),
          ...(establecimiento != null && { establecimiento }),
          ...(fechaGasto != null && { fechaGasto: new Date(fechaGasto) }),
          ...(tipoGasto != null && { tipoGasto: tipoGasto as never }),
          ...(carteraId != null && { carteraId }),
          ...(esCompartido != null && { esCompartido }),
          ...(notas != null && { notas }),
          ...(etiquetas != null && { etiquetas }),
        },
      });

      return reply.send({ ...gasto, monto: Number(gasto.monto) });
    },
  );

  // DELETE /:id — soft delete
  app.delete(
    '/:id',
    {
      schema: { tags: ['gastos'] },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { id: usuarioId } = request.user;
      const { id } = request.params;

      const existing = await app.prisma.gasto.findUnique({ where: { id } });

      if (!existing || existing.deletedAt) {
        return reply.status(404).send({ error: 'Gasto no encontrado' });
      }

      if (existing.usuarioId !== usuarioId) {
        return reply.status(403).send({ error: 'Acceso denegado' });
      }

      await app.prisma.gasto.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return reply.send({ success: true });
    },
  );
}
