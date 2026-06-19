export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UserProfileResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tenant: {
    id: string;
    subdomain: string;
  };
  permissions: string[] | null;
  preferences: UserPreferences | null;
}

export interface TenantPublicBrandResponse {
  id: string;
  subdomain: string;
  brand: {
    companyLegalName: string | null;
    loginWelcomeText: string | null;
    primaryColor: string;
    sidebarBgColor: string;
    logoUrl: string | null;
    faviconUrl: string | null;
  } | null;
}

export interface TenantPublicOption {
  id: string;
  subdomain: string;
  name: string;
  commercialName: string | null;
}

export interface UserPreferences {
  themeMode: "light" | "dark"; // 🎨 Modo visual de la UI (Tailwind CSS)
  defaultLandingPage: string | null; // 🚚 Ruta de inicio personalizada por usuario
  agGridState: Record<string, any> | null; // 📊 Objeto JSONB con los anchos y filtros de AG Grid
}
