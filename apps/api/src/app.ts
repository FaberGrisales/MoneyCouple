import Fastify from 'fastify';

import corsPlugin from './plugins/cors.plugin';
import helmetPlugin from './plugins/helmet.plugin';
import jwtPlugin from './plugins/jwt.plugin';
import prismaPlugin from './plugins/prisma.plugin';
import rateLimitPlugin from './plugins/rateLimit.plugin';
import redisPlugin from './plugins/redis.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import authRoutes from './routes/auth/auth.routes';
import carteroRoutes from './routes/carteras/carteras.routes';
import dashboardRoutes from './routes/dashboard/dashboard.routes';
import divisionesRoutes from './routes/divisiones/divisiones.routes';
import gastosRoutes from './routes/gastos/gastos.routes';
import iaRoutes from './routes/ia/ia.routes';
import metasRoutes from './routes/metas/metas.routes';
import parejasRoutes from './routes/parejas/parejas.routes';
import usuariosRoutes from './routes/usuarios/usuarios.routes';

export const buildApp = async () => {
  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    },
  });

  // Plugins
  await app.register(helmetPlugin);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);
  await app.register(prismaPlugin);
  await app.register(redisPlugin);
  await app.register(swaggerPlugin);
  await app.register(jwtPlugin);

  // Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(usuariosRoutes, { prefix: '/api/v1/users' });
  await app.register(gastosRoutes, { prefix: '/api/v1/gastos' });
  await app.register(parejasRoutes, { prefix: '/api/v1/parejas' });
  await app.register(carteroRoutes, { prefix: '/api/v1/carteras' });
  await app.register(divisionesRoutes, { prefix: '/api/v1/divisiones' });
  await app.register(metasRoutes, { prefix: '/api/v1/metas' });
  await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
  await app.register(iaRoutes, { prefix: '/api/v1/ia' });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
};
