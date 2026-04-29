import './env'; // validates env vars before anything else
import { env } from './env';
import { connectMongo, disconnectMongo } from '@moneycouple/database';
import { buildApp } from './app';

const start = async () => {
  // Connect MongoDB
  try {
    await connectMongo(env.MONGODB_URI);
    console.info('✓ MongoDB connected');
  } catch (err) {
    console.warn('⚠  MongoDB connection failed — AI storage disabled:', (err as Error).message);
  }

  const app = await buildApp();
  const host = env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

  try {
    await app.listen({ port: env.PORT, host });
    console.info(`✓ MoneyCouple API  →  http://${host}:${env.PORT}`);
    console.info(`✓ Swagger docs     →  http://${host}:${env.PORT}/documentation`);
  } catch (err) {
    app.log.error(err);
    await disconnectMongo();
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start();
