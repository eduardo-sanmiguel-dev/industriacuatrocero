import { ApiClient } from "@synergy/api-client";
import { env } from "./env";
// Nota: En Mobile se suele usar SecureStore de Expo en lugar de localStorage
import * as SecureStore from "expo-secure-store";

export const api = new ApiClient({
  baseUrl: env.EXPO_PUBLIC_API_URL,
  authToken: () => SecureStore.getItem("token"),
});
