import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
});

export const env = envSchema.parse(process.env);
