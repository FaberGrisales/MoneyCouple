import type { FastifyInstance, FastifyRequest } from 'fastify';

export default async function usuariosRoutes(app: FastifyInstance) {
  // GET /profile — return full user object (minus passwordHash)
  app.get(
    '/profile',
    {
      schema: { tags: ['usuarios'] },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const { id } = request.user;

      const user = await app.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          fotoPerfil: true,
          fechaNacimiento: true,
          tipoCuenta: true,
          parejaId: true,
          monedaDefault: true,
          idioma: true,
          modoOscuro: true,
          ingresoMensual: true,
          monedaIngreso: true,
          mostrarIngresoAPareja: true,
          esPremium: true,
          premiumHasta: true,
          emailVerificado: true,
          ultimoLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: 'Usuario no encontrado' });
      }

      return reply.send({
        ...user,
        ...(user.ingresoMensual != null && { ingresoMensual: Number(user.ingresoMensual) }),
      });
    },
  );

  // PUT /profile — update profile fields
  app.put(
    '/profile',
    {
      schema: {
        tags: ['usuarios'],
        body: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            fotoPerfil: { type: 'string' },
            fechaNacimiento: { type: 'string' },
            modoOscuro: { type: 'boolean' },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (
      request: FastifyRequest<{
        Body: {
          nombre?: string;
          apellido?: string;
          fotoPerfil?: string;
          fechaNacimiento?: string;
          modoOscuro?: boolean;
        };
      }>,
      reply,
    ) => {
      const { id } = request.user;
      const { nombre, apellido, fotoPerfil, fechaNacimiento, modoOscuro } = request.body;

      const user = await app.prisma.user.update({
        where: { id },
        data: {
          ...(nombre != null && { nombre }),
          ...(apellido != null && { apellido }),
          ...(fotoPerfil != null && { fotoPerfil }),
          ...(fechaNacimiento != null && { fechaNacimiento: new Date(fechaNacimiento) }),
          ...(modoOscuro != null && { modoOscuro }),
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          fotoPerfil: true,
          fechaNacimiento: true,
          tipoCuenta: true,
          modoOscuro: true,
          updatedAt: true,
        },
      });

      return reply.send(user);
    },
  );

  // PUT /ingresos — update monthly income
  app.put(
    '/ingresos',
    {
      schema: {
        tags: ['usuarios'],
        body: {
          type: 'object',
          required: ['ingresoMensual'],
          properties: {
            ingresoMensual: { type: 'number' },
          },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Body: { ingresoMensual: number } }>, reply) => {
      const { id } = request.user;
      const { ingresoMensual } = request.body;

      const user = await app.prisma.user.update({
        where: { id },
        data: {
          ingresoMensual,
          ingresoActualizado: new Date(),
        },
        select: {
          id: true,
          ingresoMensual: true,
          ingresoActualizado: true,
        },
      });

      return reply.send({
        ...user,
        ...(user.ingresoMensual != null && { ingresoMensual: Number(user.ingresoMensual) }),
      });
    },
  );
}
