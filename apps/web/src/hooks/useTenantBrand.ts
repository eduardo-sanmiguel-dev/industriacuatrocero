import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { TenantPublicBrandResponse, TenantPublicOption } from "@synergy/types";
import { api } from "../api"; // Tu ApiClient centralizado con Axios
import { useTenantBrandStore } from "../store/tenantBrand.store";
import { isDevelopment } from "../env";

function resolveTargetSubdomain(hostname: string): string {
  return hostname.split(".")[0] || "";
}

/**
 * Hook personalizado para gestionar el descubrimiento automático de Marca Blanca
 * basándose en el subdominio actual del navegador web.
 */
export function useTenantBrand() {
  const brandJson = useTenantBrandStore((state) => state.tenantBrand);
  const errorLog = useTenantBrandStore((state) => state.tenantBrandError);
  const isLoading = useTenantBrandStore((state) => state.tenantBrandLoading);
  const setTenantBrand = useTenantBrandStore((state) => state.setTenantBrand);
  const setTenantBrandError = useTenantBrandStore(
    (state) => state.setTenantBrandError,
  );
  const setTenantBrandLoading = useTenantBrandStore(
    (state) => state.setTenantBrandLoading,
  );
  const selectedTenantSubdomain = useTenantBrandStore(
    (state) => state.selectedTenantSubdomain,
  );
  const setSelectedTenantSubdomain = useTenantBrandStore(
    (state) => state.setSelectedTenantSubdomain,
  );

  const hostSubdomain = useMemo(
    () => resolveTargetSubdomain(window.location.hostname),
    [],
  );

  const targetSubdomain = isDevelopment
    ? selectedTenantSubdomain || ""
    : hostSubdomain;

  const registeredTenantsQuery = useQuery({
    queryKey: ["registered-tenants"],
    queryFn: () => api.get<TenantPublicOption[]>("/core/tenants/registered"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: isDevelopment,
  });

  const tenantBrandQuery = useQuery({
    queryKey: ["tenant-brand", targetSubdomain],
    queryFn: () =>
      api.get<TenantPublicBrandResponse>(
        `/core/tenants/subdomain/${targetSubdomain}/brand`,
      ),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!targetSubdomain,
  });

  useEffect(() => {
    if (isDevelopment && !targetSubdomain) {
      setTenantBrandLoading(false);
      return;
    }

    setTenantBrandLoading(
      tenantBrandQuery.isLoading || tenantBrandQuery.isFetching,
    );
  }, [
    setTenantBrandLoading,
    targetSubdomain,
    tenantBrandQuery.isFetching,
    tenantBrandQuery.isLoading,
  ]);

  useEffect(() => {
    if (!isDevelopment || targetSubdomain) return;

    setTenantBrand(null);
    setTenantBrandError("Selecciona un tenant para simular en desarrollo.");
  }, [isDevelopment, setTenantBrand, setTenantBrandError, targetSubdomain]);

  useEffect(() => {
    if (!tenantBrandQuery.data) return;

    setTenantBrand(tenantBrandQuery.data);
    setTenantBrandError(null);
  }, [setTenantBrand, setTenantBrandError, tenantBrandQuery.data]);

  useEffect(() => {
    if (!tenantBrandQuery.error) return;

    console.error(
      "Error en el descubrimiento del Tenant mediante hook:",
      tenantBrandQuery.error,
    );
    setTenantBrandError(
      "No se pudo conectar con el servidor o el subdominio no existe.",
    );
  }, [setTenantBrandError, tenantBrandQuery.error]);

  useEffect(() => {
    if (!isDevelopment || !registeredTenantsQuery.error) return;

    console.error(
      "Error al consultar tenants registrados en desarrollo:",
      registeredTenantsQuery.error,
    );
    setTenantBrandError(
      "No se pudo cargar el listado de tenants para desarrollo.",
    );
  }, [registeredTenantsQuery.error, setTenantBrandError]);

  // Retornamos un objeto de control limpio y fuertemente tipado
  return {
    brandJson,
    errorLog,
    isLoading,
    selectedTenantSubdomain,
    setSelectedTenantSubdomain,
    availableTenants: registeredTenantsQuery.data ?? [],
    isLoadingTenants: registeredTenantsQuery.isLoading,
    needsTenantSelection: isDevelopment && !selectedTenantSubdomain,
    // Helper utilitario por si tu UI necesita evaluar rápido si ya hay marca
    hasBrand: !!brandJson?.brand,
  };
}
