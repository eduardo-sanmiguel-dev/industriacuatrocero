import { create } from "zustand";
import { TenantPublicBrandResponse } from "@synergy/types";

interface TenantBrandStore {
  tenantBrand: TenantPublicBrandResponse | null;
  tenantBrandError: string | null;
  tenantBrandLoading: boolean;
  selectedTenantSubdomain: string | null;
  setTenantBrand: (tenantBrand: TenantPublicBrandResponse | null) => void;
  setTenantBrandError: (tenantBrandError: string | null) => void;
  setTenantBrandLoading: (tenantBrandLoading: boolean) => void;
  setSelectedTenantSubdomain: (selectedTenantSubdomain: string | null) => void;
}

export const useTenantBrandStore = create<TenantBrandStore>((set) => ({
  tenantBrand: null,
  tenantBrandError: null,
  tenantBrandLoading: true,
  selectedTenantSubdomain: null,
  setTenantBrand: (tenantBrand) => set({ tenantBrand }),
  setTenantBrandError: (tenantBrandError) => set({ tenantBrandError }),
  setTenantBrandLoading: (tenantBrandLoading) => set({ tenantBrandLoading }),
  setSelectedTenantSubdomain: (selectedTenantSubdomain) =>
    set({ selectedTenantSubdomain }),
}));
