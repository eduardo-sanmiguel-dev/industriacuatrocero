import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// 🌎 CONTRATO MONOREPO: Consumimos las interfaces compartidas del ecosistema
import { LoginResponse } from "@synergy/types";

/**
 * Configuración de inicialización para el cliente API global del SaaS
 */
export interface ApiClientConfig {
  /** URL base de la API de NestJS (ej: 'http://localhost:3000/api/v1') */
  baseUrl: string;
  /** 📱 Opcional para Mobile: Función para recuperar el token del almacenamiento seguro del celular */
  getMobileToken?: () => Promise<string | null>;
  /** 📱 Opcional para Mobile: Función para recuperar el Refresh Token del almacenamiento seguro del celular */
  getMobileRefreshToken?: () => Promise<string | null>;
  /** 📱 Opcional para Mobile: Función para guardar el token de 15 minutos recién renovado */
  saveMobileToken?: (token: string) => Promise<void>;
  /** 🔒 Función de escape obligatoria: Redirección al login cuando la semana de gracia expire */
  onSessionExpired: () => void;
}

export class SynergyApiClient {
  private readonly http: AxiosInstance;
  private readonly config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;

    // 1. 🏗️ INSTANCIACIÓN DIRECTA DE AXIOS
    this.http = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000, // ⏱️ Tiempo límite de 10 segundos por petición defensiva
      withCredentials: true, // 🌐 REGLA WEB (Vite): Permite enviar y recibir automáticamente cookies HttpOnly
    });

    // 2. ⚡ INICIALIZACIÓN DE INTERCEPTORES DE CAPA INFRAESTRUCTURAL
    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  /**
   * 🛡️ INTERCEPTOR DE SALIDA (REQUEST): Prepara la petición antes de viajar por la red
   */
  private initializeRequestInterceptor(): void {
    this.http.interceptors.request.use(
      async (requestConfig: InternalAxiosRequestConfig) => {
        // 📱 COMPORTAMIENTO MÓVIL (Expo): Si existe la función, inyectamos el Bearer Token manualmente
        if (this.config.getMobileToken) {
          const mobileToken = await this.config.getMobileToken();
          if (mobileToken) {
            requestConfig.headers.set("Authorization", `Bearer ${mobileToken}`);
          }
        }
        return requestConfig;
      },
      (error) => Promise.reject(error),
    );
  }

  /**
   * 🧠 INTERCEPTOR DE ENTRADA (RESPONSE) REACTIVO: Atrapa los fallos 401 y ejecuta la renovación silenciosa
   */
  private initializeResponseInterceptor(): void {
    this.http.interceptors.response.use(
      (response: AxiosResponse) => response, // Si la petición es exitosa (200, 201), déjala pasar libremente
      async (error) => {
        const originalRequest = error.config;

        // 🔍 CONDICIÓN DE RENOVACIÓN DE INSTANCIA: Si el servidor responde 401 y el reintento no ha sido activado
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true; // Sella la bandera para evitar bucles infinitos por red

          try {
            // 📱 REFRESH EN CANAL MÓVIL (Expo)
            if (
              this.config.getMobileRefreshToken &&
              this.config.saveMobileToken
            ) {
              const mobileRefresh = await this.config.getMobileRefreshToken();

              if (!mobileRefresh)
                throw new Error("Token de renovación móvil ausente.");

              // Invocamos el refresh mandando el token explícito en el JSON
              const refreshResponse = await axios.post<LoginResponse>(
                `${this.config.baseUrl}/auth/refresh`,
                { refreshToken: mobileRefresh },
              );

              const newAccessToken = refreshResponse.data.accessToken;
              if (newAccessToken) {
                await this.config.saveMobileToken(newAccessToken); // Persiste el token en el hardware seguro del teléfono
                originalRequest.headers.set(
                  "Authorization",
                  `Bearer ${newAccessToken}`,
                ); // Lo monta en la petición pausada
              }
            } else {
              // 🌐 REFRESH EN CANAL WEB (Vite)
              // Al estar configurado con 'withCredentials: true', Axios viaja al endpoint de NestJS,
              // el servidor lee la cookie HttpOnly de 7 días, rota las llaves e inyecta las cookies nuevas solas.
              await axios.post(
                `${this.config.baseUrl}/auth/refresh`,
                {},
                { withCredentials: true },
              );
            }

            // 🚀 REINTENTO TRANSPARENTE: Volvemos a disparar la petición original congelada
            return this.http(originalRequest);
          } catch (refreshError) {
            // 🔒 CIERRE SEMANAL FORZADO: Si el refresco asíncrono falla, la semana de gracia expiró definitivamente
            this.config.onSessionExpired();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * 📂 MÉTODOS DE ACCESO PÚBLICOS TIPADOS END-TO-END (E2E)
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.get<T>(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.http.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.http.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.http.delete<T>(url, config);
    return response.data;
  }
}
