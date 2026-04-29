import { buildApp } from './app';

const start = async () => {
  const app = await buildApp();
  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  const host = process.env['NODE_ENV'] === 'production' ? '0.0.0.0' : '127.0.0.1';

  try {
    await app.listen({ port, host });
    console.warn(`MoneyCouple API running on http://${host}:${port}`);
    console.warn(`Swagger docs: http://${host}:${port}/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
