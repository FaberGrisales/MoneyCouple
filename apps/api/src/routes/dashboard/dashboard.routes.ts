import type { FastifyInstance } from 'fastify';

export default async function dashboardRoutes(app: FastifyInstance) {
  // GET / — dashboard summary for authenticated user
  app.get(
    '/',
    {
      schema: { tags: ['dashboard'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id: usuarioId } = request.user;

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const mesActual = `${year}-${String(month).padStart(2, '0')}`;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      // Fetch all data in parallel
      const [gastos, carteras, metasActivas] = await Promise.all([
        app.prisma.gasto.findMany({
          where: {
            usuarioId,
            deletedAt: null,
            fechaGasto: { gte: startDate, lt: endDate },
          },
          orderBy: { fechaGasto: 'desc' },
        }),
        app.prisma.cartera.findMany({
          where: { usuarioId, activa: true },
          select: {
            id: true,
            nombre: true,
            tipo: true,
            saldoActual: true,
            icono: true,
            color: true,
          },
        }),
        app.prisma.meta.findMany({
          where: {
            usuarioId,
            estado: 'ACTIVA',
          },
          select: {
            id: true,
            titulo: true,
            montoActual: true,
            montoObjetivo: true,
            tipo: true,
          },
        }),
      ]);

      const totalGastos = gastos.reduce((sum, g) => sum + Number(g.monto), 0);
      const totalGastosPersonales = gastos
        .filter((g) => !g.esCompartido)
        .reduce((sum, g) => sum + Number(g.monto), 0);
      const totalGastosCompartidos = gastos
        .filter((g) => g.esCompartido)
        .reduce((sum, g) => sum + Number(g.monto), 0);

      // Group by categoria
      const catMap = new Map<string, { total: number; count: number }>();
      for (const g of gastos) {
        const key = g.categoria;
        const existing = catMap.get(key);
        if (existing) {
          existing.total += Number(g.monto);
          existing.count += 1;
        } else {
          catMap.set(key, { total: Number(g.monto), count: 1 });
        }
      }
      const porCategoria = Array.from(catMap.entries()).map(([categoria, data]) => ({
        categoria,
        total: data.total,
        count: data.count,
      }));

      const gastosRecientes = gastos.slice(0, 5).map((g) => ({
        ...g,
        monto: Number(g.monto),
      }));

      return reply.send({
        mesActual,
        totalGastos,
        totalGastosPersonales,
        totalGastosCompartidos,
        porCategoria,
        gastosRecientes,
        carteras: carteras.map((c) => ({ ...c, saldoActual: Number(c.saldoActual) })),
        metasActivas: metasActivas.map((m) => ({
          ...m,
          montoActual: Number(m.montoActual),
          montoObjetivo: Number(m.montoObjetivo),
        })),
      });
    },
  );
}
