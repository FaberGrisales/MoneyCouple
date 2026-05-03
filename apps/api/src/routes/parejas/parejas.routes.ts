import type { FastifyInstance, FastifyRequest } from 'fastify';

function generateCodigo(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default async function parejasRoutes(app: FastifyInstance) {
  // POST /invitar — generate coupling code and create Pareja
  app.post(
    '/invitar',
    {
      schema: { tags: ['parejas'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id: usuarioId } = request.user;

      // Check if user already has a pareja
      const user = await app.prisma.user.findUnique({
        where: { id: usuarioId },
        select: { parejaId: true },
      });

      if (!user) {
        return reply.status(404).send({ error: 'Usuario no encontrado' });
      }

      // Generate unique codigo
      let codigo = generateCodigo();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await app.prisma.pareja.findUnique({
          where: { codigoVinculacion: codigo },
        });
        if (!existing) break;
        codigo = generateCodigo();
        attempts++;
      }

      const codigoExpiracion = new Date(Date.now() + 48 * 60 * 60 * 1000);

      let pareja;
      if (user.parejaId) {
        // Update existing pareja with new code
        pareja = await app.prisma.pareja.update({
          where: { id: user.parejaId },
          data: { codigoVinculacion: codigo, codigoExpiracion },
        });
      } else {
        // Create new pareja
        pareja = await app.prisma.pareja.create({
          data: {
            codigoVinculacion: codigo,
            codigoExpiracion,
            usuarios: { connect: { id: usuarioId } },
          },
        });

        // Update user's parejaId
        await app.prisma.user.update({
          where: { id: usuarioId },
          data: { parejaId: pareja.id },
        });
      }

      return reply.status(201).send({ codigo, parejaId: pareja.id, expiresAt: codigoExpiracion });
    },
  );

  // POST /aceptar — accept invitation via code
  app.post(
    '/aceptar',
    {
      schema: {
        tags: ['parejas'],
        body: {
          type: 'object',
          required: ['codigo'],
          properties: { codigo: { type: 'string' } },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Body: { codigo: string } }>, reply) => {
      const { id: usuarioId } = request.user;
      const { codigo } = request.body;

      const pareja = await app.prisma.pareja.findUnique({
        where: { codigoVinculacion: codigo },
        include: { usuarios: { select: { id: true } } },
      });

      if (!pareja) {
        return reply.status(404).send({ error: 'Código de vinculación no válido' });
      }

      if (!pareja.codigoExpiracion || pareja.codigoExpiracion < new Date()) {
        return reply.status(400).send({ error: 'El código ha expirado' });
      }

      // Check user isn't already in this pareja
      if (pareja.usuarios.some((u) => u.id === usuarioId)) {
        return reply.status(400).send({ error: 'Ya perteneces a esta pareja' });
      }

      // Link second user and clear code
      const updatedPareja = await app.prisma.pareja.update({
        where: { id: pareja.id },
        data: {
          codigoVinculacion: null,
          codigoExpiracion: null,
          fechaVinculacion: new Date(),
          usuarios: { connect: { id: usuarioId } },
        },
        include: {
          usuarios: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              fotoPerfil: true,
            },
          },
        },
      });

      await app.prisma.user.update({
        where: { id: usuarioId },
        data: { parejaId: pareja.id },
      });

      return reply.send(updatedPareja);
    },
  );

  // GET / — return pareja with both users
  app.get(
    '/',
    {
      schema: { tags: ['parejas'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id: usuarioId } = request.user;

      const user = await app.prisma.user.findUnique({
        where: { id: usuarioId },
        select: { parejaId: true },
      });

      if (!user?.parejaId) {
        return reply.status(404).send({ error: 'No tienes pareja vinculada' });
      }

      const pareja = await app.prisma.pareja.findUnique({
        where: { id: user.parejaId },
        include: {
          usuarios: {
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              fotoPerfil: true,
            },
          },
        },
      });

      if (!pareja) {
        return reply.status(404).send({ error: 'Pareja no encontrada' });
      }

      return reply.send({
        ...pareja,
        ...(pareja.presupuestoMensual != null && {
          presupuestoMensual: Number(pareja.presupuestoMensual),
        }),
        ...(pareja.porcentajeUsuario1 != null && {
          porcentajeUsuario1: Number(pareja.porcentajeUsuario1),
        }),
        ...(pareja.porcentajeUsuario2 != null && {
          porcentajeUsuario2: Number(pareja.porcentajeUsuario2),
        }),
      });
    },
  );

  // GET /gastos — list gastos for the pareja this month
  app.get(
    '/gastos',
    {
      schema: { tags: ['parejas'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id: usuarioId } = request.user;

      const user = await app.prisma.user.findUnique({
        where: { id: usuarioId },
        select: { parejaId: true },
      });

      if (!user?.parejaId) {
        return reply.status(404).send({ error: 'No tienes pareja vinculada' });
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const gastos = await app.prisma.gasto.findMany({
        where: {
          parejaId: user.parejaId,
          deletedAt: null,
          fechaGasto: { gte: startDate, lt: endDate },
        },
        orderBy: { fechaGasto: 'desc' },
        include: {
          usuario: { select: { id: true, nombre: true, fotoPerfil: true } },
        },
      });

      return reply.send(gastos.map((g) => ({ ...g, monto: Number(g.monto) })));
    },
  );
}
