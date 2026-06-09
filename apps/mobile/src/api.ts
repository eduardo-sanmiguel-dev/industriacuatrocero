import { SynergyApiClient } from "@synergy/api-client";
import * as SecureStore from "expo-secure-store";

export const api = new SynergyApiClient({
  baseUrl: "http://synergy.com",
  getMobileToken: () => SecureStore.getItemAsync("access_token"),
  getMobileRefreshToken: () => SecureStore.getItemAsync("refresh_token"),
  saveMobileToken: (token) => SecureStore.setItemAsync("access_token", token),
  onSessionExpired: () => {
    // Código nativo de tu router para mandar a Eduardo o Victoria al Login de Expo
  },
});
