import axios, { AxiosInstance } from "axios";

export interface ApiClientConfig {
  baseUrl: string;
  authToken?: string | (() => string | null | undefined);
}

export class ApiClient {
  public http: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor dinámico para adjuntar el Token JWT en cada petición
    this.http.interceptors.request.use((axiosConfig) => {
      const token =
        typeof config.authToken === "function"
          ? config.authToken()
          : config.authToken;

      if (token && axiosConfig.headers) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }
      return axiosConfig;
    });
  }

  /**
   * Ejemplo de servicio unificado para Autenticación / Usuarios
   * Usamos los tipos compartidos para garantizar respuestas tipadas
   */
  public async getProfile() {
    // Importamos dinámicamente el tipo para evitar dependencias circulares duras
    const response =
      await this.http.get<import("@synergy/types").User>("/users/profile");
    return response.data;
  }

  // Puedes añadir aquí más métodos comunes compartidos:
  // public async login(credentials: LoginDto) { ... }
}
