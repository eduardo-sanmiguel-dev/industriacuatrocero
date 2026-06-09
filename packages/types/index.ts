export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  accessToken?: string;
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
