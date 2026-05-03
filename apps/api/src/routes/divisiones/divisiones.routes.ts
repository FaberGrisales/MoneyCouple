import type { FastifyInstance, FastifyRequest } from 'fastify';

function getCurrentMes(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getMonthRange(mes: string): { startDate: Date; endDate: Date } {
  const [yearStr, monthStr] = mes.split('-');
  const year = parseInt(yearStr ?? String(new Date().getFullYear()), 10);
  const month = parseInt(monthStr ?? String(new Date().getMonth() + 1), 10);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  return { startDate, endDate };
}

export default async function divisionesRoutes(app: FastifyInstance) {
  // GET /actual — calculate or retrieve current month's division
  app.get(
    '/actual',
    {
      schema: { tags: ['divisiones'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id: usuarioId } = request.user;

      // 1. Get user's parejaId
      const user = await app.prisma.user.findUnique({
        where: { id: usuarioId },
        select: { parejaId: true },
      });

      if (!user?.parejaId) {
        return reply.status(404).send({ error: 'No tienes pareja vinculada' });
      }

      const parejaId = user.parejaId;

      // 2. Get pareja with usuarios
      const pareja = await app.prisma.pareja.findUnique({
        where: { id: parejaId },
        include: {
          usuarios: {
            select: { id: true, nombre: true, ingresoMensual: true },
          },
        },
      });

      if (!pareja) {
        return reply.status(404).send({ error: 'Pareja no encontrada' });
      }

      if (pareja.usuarios.length < 2) {
        return reply.status(400).send({ error: 'La pareja no está completa' });
      }

      const mes = getCurrentMes();
      const { startDate, endDate } = getMonthRange(mes);

      // 3. Identify usuario1 and usuario2
      const usuario1 = pareja.usuarios[0]!;
      const usuario2 = pareja.usuarios[1]!;

      // 4. Get all shared gastos for this pareja this month
      const gastosCompartidos = await app.prisma.gasto.findMany({
        where: {
          parejaId,
          esCompartido: true,
          deletedAt: null,
          fechaGasto: { gte: startDate, lt: endDate },
        },
        include: {
          usuario: { select: { id: true, nombre: true } },
        },
        orderBy: { fechaGasto: 'desc' },
      });

      // 5. Sum gastos per user (what they actually paid)
      const usuario1YaPago = gastosCompartidos
        .filter((g) => g.usuarioId === usuario1.id)
        .reduce((sum, g) => sum + Number(g.monto), 0);

      const usuario2YaPago = gastosCompartidos
        .filter((g) => g.usuarioId === usuario2.id)
        .reduce((sum, g) => sum + Number(g.monto), 0);

      // 6. Total shared gastos
      const totalGastosCompartidos = usuario1YaPago + usuario2YaPago;

      // 7. Calculate split percentages based on tipoDivision
      let pct1: number;
      let pct2: number;

      if (pareja.tipoDivision === 'CINCUENTA_CINCUENTA') {
        pct1 = 50;
        pct2 = 50;
      } else if (pareja.tipoDivision === 'POR_INGRESOS') {
        const ingreso1 = Number(usuario1.ingresoMensual ?? 0);
        const ingreso2 = Number(usuario2.ingresoMensual ?? 0);
        const totalIngresos = ingreso1 + ingreso2;
        if (totalIngresos > 0) {
          pct1 = (ingreso1 / totalIngresos) * 100;
          pct2 = 100 - pct1;
        } else {
          pct1 = 50;
          pct2 = 50;
        }
      } else {
        // CUSTOM
        pct1 = Number(pareja.porcentajeUsuario1 ?? 50);
        pct2 = Number(pareja.porcentajeUsuario2 ?? 50);
      }

      // 8. Calculate how much each should pay
      const usuario1DebePagar = (totalGastosCompartidos * pct1) / 100;
      const usuario2DebePagar = (totalGastosCompartidos * pct2) / 100;

      // 9. Balances (positive = overpaid = owed money)
      const balanceUsuario1 = usuario1YaPago - usuario1DebePagar;
      const balanceUsuario2 = usuario2YaPago - usuario2DebePagar;

      // 10. Determine debtor/creditor
      let deudorId: string | null = null;
      let acreedorId: string | null = null;
      let montoDebido = 0;

      if (Math.abs(balanceUsuario1) > 0.01) {
        if (balanceUsuario1 < 0) {
          // usuario1 underpaid → owes money to usuario2
          deudorId = usuario1.id;
          acreedorId = usuario2.id;
          montoDebido = Math.abs(balanceUsuario1);
        } else {
          // usuario2 underpaid → owes money to usuario1
          deudorId = usuario2.id;
          acreedorId = usuario1.id;
          montoDebido = Math.abs(balanceUsuario2);
        }
      }

      // 11. Upsert Division record
      const division = await app.prisma.division.upsert({
        where: { parejaId_mes: { parejaId, mes } },
        create: {
          parejaId,
          mes,
          ingresoUsuario1: Number(usuario1.ingresoMensual ?? 0),
          ingresoUsuario2: Number(usuario2.ingresoMensual ?? 0),
          porcentajeUsuario1: pct1,
          porcentajeUsuario2: pct2,
          totalGastosCompartidos,
          usuario1DebePagar,
          usuario2DebePagar,
          usuario1YaPago,
          usuario2YaPago,
          balanceUsuario1,
          balanceUsuario2,
          ...(deudorId != null && { deudorId }),
          ...(acreedorId != null && { acreedorId }),
          ...(montoDebido > 0 && { montoDebido }),
          saldado: false,
        },
        update: {
          ingresoUsuario1: Number(usuario1.ingresoMensual ?? 0),
          ingresoUsuario2: Number(usuario2.ingresoMensual ?? 0),
          porcentajeUsuario1: pct1,
          porcentajeUsuario2: pct2,
          totalGastosCompartidos,
          usuario1DebePagar,
          usuario2DebePagar,
          usuario1YaPago,
          usuario2YaPago,
          balanceUsuario1,
          balanceUsuario2,
          ...(deudorId != null && { deudorId }),
          ...(acreedorId != null && { acreedorId }),
          ...(montoDebido > 0 && { montoDebido }),
        },
      });

      // 12. Return response
      return reply.send({
        mes,
        usuario1: {
          id: usuario1.id,
          nombre: usuario1.nombre,
          yaPago: usuario1YaPago,
          debePagar: usuario1DebePagar,
          balance: balanceUsuario1,
        },
        usuario2: {
          id: usuario2.id,
          nombre: usuario2.nombre,
          yaPago: usuario2YaPago,
          debePagar: usuario2DebePagar,
          balance: balanceUsuario2,
        },
        totalGastosCompartidos,
        tipoDivision: pareja.tipoDivision,
        ...(deudorId != null && { deudorId }),
        ...(acreedorId != null && { acreedorId }),
        montoDebido,
        saldado: division.saldado,
        gastos: gastosCompartidos.map((g) => ({
          ...g,
          monto: Number(g.monto),
        })),
      });
    },
  );

  // POST /saldar — mark current month's division as settled
  app.post(
    '/saldar',
    {
      schema: {
        tags: ['divisiones'],
        body: {
          type: 'object',
          properties: {
            mes: { type: 'string' },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Body: { mes?: string } }>, reply) => {
      const { id: usuarioId } = request.user;
      const mes = request.body.mes ?? getCurrentMes();

      const user = await app.prisma.user.findUnique({
        where: { id: usuarioId },
        select: { parejaId: true },
      });

      if (!user?.parejaId) {
        return reply.status(404).send({ error: 'No tienes pareja vinculada' });
      }

      const parejaId = user.parejaId;

      const division = await app.prisma.division.findUnique({
        where: { parejaId_mes: { parejaId, mes } },
      });

      if (!division) {
        return reply.status(404).send({ error: 'División no encontrada para este mes' });
      }

      const updated = await app.prisma.division.update({
        where: { parejaId_mes: { parejaId, mes } },
        data: { saldado: true },
      });

      return reply.send({
        ...updated,
        ingresoUsuario1: Number(updated.ingresoUsuario1),
        ingresoUsuario2: Number(updated.ingresoUsuario2),
        porcentajeUsuario1: Number(updated.porcentajeUsuario1),
        porcentajeUsuario2: Number(updated.porcentajeUsuario2),
        totalGastosCompartidos: Number(updated.totalGastosCompartidos),
        usuario1DebePagar: Number(updated.usuario1DebePagar),
        usuario2DebePagar: Number(updated.usuario2DebePagar),
        usuario1YaPago: Number(updated.usuario1YaPago),
        usuario2YaPago: Number(updated.usuario2YaPago),
        balanceUsuario1: Number(updated.balanceUsuario1),
        balanceUsuario2: Number(updated.balanceUsuario2),
        ...(updated.montoDebido != null && { montoDebido: Number(updated.montoDebido) }),
      });
    },
  );
}
