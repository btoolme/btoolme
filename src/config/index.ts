import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().includes('.apps.googleusercontent.com'),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  EMAIL_FROM: z.string().email()
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
}

export const ENV = validateEnv();

export const CONFIG = {
  isDev: ENV.NODE_ENV === 'development',
  isProd: ENV.NODE_ENV === 'production',
  isTest: ENV.NODE_ENV === 'test',
  
  email: {
    clientId: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    refreshToken: ENV.GOOGLE_REFRESH_TOKEN,
    user: ENV.EMAIL_FROM
  },
  
  database: {
    url: ENV.DATABASE_URL
  }
} as const;
