import { z } from "zod";

export enum Environment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
  TESTING = "testing",
}

const envSchema = z.object({
  NODE_ENV: z.nativeEnum(Environment),
  VITE_API_URL: z.string().url(),
});

const runtimeEnv = {
  ...import.meta.env,
  NODE_ENV:
    import.meta.env.NODE_ENV || import.meta.env.MODE || Environment.DEVELOPMENT,
};

export const parsedEnv = envSchema.parse(runtimeEnv); // Vite usa import.meta.env
export const env = parsedEnv;
export const isProduction = parsedEnv.NODE_ENV === Environment.PRODUCTION;
export const isDevelopment = parsedEnv.NODE_ENV === Environment.DEVELOPMENT;
export const isTesting = parsedEnv.NODE_ENV === Environment.TESTING;
