import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

const envSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8, {
    message: 'El JWT_REFRESH_SECRET debe tener al menos 8 caracteres.',
  }),
});

const parsedEnv = envSchema.parse(process.env);

export const env = parsedEnv;
export const isProduction = parsedEnv.NODE_ENV === Environment.PRODUCTION;
export const isDevelopment = parsedEnv.NODE_ENV === Environment.DEVELOPMENT;
export const isTesting = parsedEnv.NODE_ENV === Environment.TESTING;
