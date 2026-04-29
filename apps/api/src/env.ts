import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  CLERK_SECRET_KEY: z.string().default(''),
  CLERK_PUBLISHABLE_KEY: z.string().default(''),

  GEMINI_API_KEY: z.string().default(''),
  GOOGLE_SPEECH_API_KEY: z.string().default(''),

  R2_ENDPOINT: z.string().default(''),
  R2_ACCESS_KEY: z.string().default(''),
  R2_SECRET_KEY: z.string().default(''),
  R2_BUCKET: z.string().default('moneycouple-dev'),
  R2_PUBLIC_URL: z.string().default(''),

  CORS_ORIGINS: z.string().default('http://localhost:8081'),
  API_URL: z.string().default('http://localhost:3000'),

  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  for (const [field, issues] of Object.entries(parsed.error.flatten().fieldErrors)) {
    console.error(`   ${field}: ${(issues as string[]).join(', ')}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
