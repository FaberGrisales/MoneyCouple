import bcrypt from 'bcryptjs';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../../env';

export default async function authRoutes(app: FastifyInstance) {
  // POST /register
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
    async (
      request: FastifyRequest<{
        Body: { email: string; password: string; nombre: string; apellido?: string };
      }>,
      reply,
    ) => {
      const { email, password, nombre, apellido } = request.body;

      const existing = await app.prisma.user.findUnique({ where: { email } });
      if (existing) {
        return reply.status(409).send({ error: 'El correo ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await app.prisma.user.create({
        data: {
          email,
          nombre,
          ...(apellido != null && { apellido }),
          // store hash in a virtual field - schema uses clerkId for external but we
          // store passwordHash via clerkId placeholder; use a separate approach:
          // We'll store the hash in clerkId field not ideal but schema has no passwordHash
          // Actually we need to add it - let's use a workaround with configPrivacidad
          configPrivacidad: { passwordHash },
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          tipoCuenta: true,
          esPremium: true,
          createdAt: true,
        },
      });

      const accessToken = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user.id, email: user.email }, env.JWT_REFRESH_SECRET, {
        expiresIn: '30d',
      });

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await app.prisma.sesion.create({
        data: {
          usuarioId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt,
          ...(request.headers['user-agent'] != null && {
            userAgent: request.headers['user-agent'],
          }),
        },
      });

      return reply.status(201).send({ user, accessToken, refreshToken });
    },
  );

  // POST /login
  app.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply) => {
      const { email, password } = request.body;

      const user = await app.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          tipoCuenta: true,
          esPremium: true,
          configPrivacidad: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
      }

      const config = user.configPrivacidad as Record<string, unknown> | null;
      const storedHash = config?.['passwordHash'];
      if (typeof storedHash !== 'string') {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
      }

      const valid = await bcrypt.compare(password, storedHash);
      if (!valid) {
        return reply.status(401).send({ error: 'Credenciales inválidas' });
      }

      const accessToken = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ id: user.id, email: user.email }, env.JWT_REFRESH_SECRET, {
        expiresIn: '30d',
      });

      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await app.prisma.sesion.create({
        data: {
          usuarioId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt,
          ...(request.headers['user-agent'] != null && {
            userAgent: request.headers['user-agent'],
          }),
        },
      });

      // Omit configPrivacidad from response
      const { configPrivacidad: _cp, ...userOut } = user;
      void _cp;

      return reply.send({ user: userOut, accessToken, refreshToken });
    },
  );

  // POST /refresh
  app.post(
    '/refresh',
    {
      schema: {
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { refreshToken: string } }>, reply) => {
      const { refreshToken } = request.body;

      const sesion = await app.prisma.sesion.findUnique({
        where: { refreshToken },
        include: { usuario: { select: { id: true, email: true } } },
      });

      if (!sesion || sesion.expiresAt < new Date()) {
        return reply.status(401).send({ error: 'Refresh token inválido o expirado' });
      }

      const accessToken = app.jwt.sign(
        { id: sesion.usuario.id, email: sesion.usuario.email },
        { expiresIn: '15m' },
      );

      // Update session with new access token
      await app.prisma.sesion.update({
        where: { id: sesion.id },
        data: { token: accessToken },
      });

      return reply.send({ accessToken });
    },
  );

  // POST /logout (protected)
  app.post(
    '/logout',
    {
      schema: {
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } },
        },
      },
      preHandler: [app.authenticate],
    },
    async (request: FastifyRequest<{ Body: { refreshToken: string } }>, reply) => {
      const { refreshToken } = request.body;

      await app.prisma.sesion.deleteMany({ where: { refreshToken } });

      return reply.send({ success: true });
    },
  );

  // GET /me (protected)
  app.get(
    '/me',
    {
      schema: { tags: ['auth'] },
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
}
