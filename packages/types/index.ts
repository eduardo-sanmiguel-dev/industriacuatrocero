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
