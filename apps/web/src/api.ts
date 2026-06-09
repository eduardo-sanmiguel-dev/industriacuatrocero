import { SynergyApiClient } from "@synergy/api-client";
import { env } from "./env";

export const api = new SynergyApiClient({
  baseUrl: env.VITE_API_URL,
  onSessionExpired: () => {
    window.location.href = "/login"; // Expulsión directa si falla el refresh de 7 días
  },
});

// Consumo directo con contratos tipados de tus catálogos
// api.get<HcmArea[]>('/hcm/areas') -> Sabe el tipo de dato y no requiere arrastrar tenantId
