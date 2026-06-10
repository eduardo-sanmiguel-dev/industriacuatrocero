import { useEffect, useState } from "react";
import { TenantPublicBrandResponse } from "@synergy/types";
import { api } from "../api"; // Tu ApiClient centralizado con Axios

/**
 * Hook personalizado para gestionar el descubrimiento automático de Marca Blanca
 * basándose en el subdominio actual del navegador web.
 */
export function useTenantBrand() {
  const [brandJson, setBrandJson] = useState<TenantPublicBrandResponse | null>(
    null,
  );
  const [errorLog, setErrorLog] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const host = window.location.hostname;

    // Extraemos la primera posición del arreglo de red
    const extractedSubdomain = host.split(".")[0] || "";

    // Escape de desarrollo local unificado
    const targetSubdomain =
      extractedSubdomain === "localhost" || extractedSubdomain === "127"
        ? "hada" // Cambia a 'trujillo' según requieras probar en local
        : extractedSubdomain;

    api
      .get<TenantPublicBrandResponse>(
        `/core/tenants/subdomain/${targetSubdomain}/brand`,
      )
      .then((data) => {
        setBrandJson(data);
      })
      .catch((err: unknown) => {
        console.error(
          "Error en el descubrimiento del Tenant mediante hook:",
          err,
        );
        setErrorLog(
          "No se pudo conectar con el servidor o el subdominio no existe.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Retornamos un objeto de control limpio y fuertemente tipado
  return {
    brandJson,
    errorLog,
    isLoading,
    // Helper utilitario por si tu UI necesita evaluar rápido si ya hay marca
    hasBrand: !!brandJson?.brand,
  };
}
