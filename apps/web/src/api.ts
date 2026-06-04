import { ApiClient } from "@synergy/api-client";
import { env } from "./env";

export const api = new ApiClient({
  baseUrl: env.VITE_API_URL,
  authToken: () => localStorage.getItem("token"), // Lee el token dinámicamente
});
