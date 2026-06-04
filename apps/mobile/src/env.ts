import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
});

// Expo inyecta las variables en process.env
export const env = envSchema.parse(process.env);
