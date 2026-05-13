import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse
} from 'axios';


interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  public client: AxiosInstance;
  private accessToken: string | null = null;
  private readonly TOKEN_STORAGE_KEY = 'lifeLiftToken';

  constructor(baseURL: string) {
    this.accessToken = this.loadToken();

    this.client = axios.create({
      baseURL,
      withCredentials: false,
    });

    this._setupInterceptors();
  }

  public setToken(token: string | null): void {
    this.accessToken = token;
    this.saveToken(token);
  }

  private loadToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private saveToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(this.TOKEN_STORAGE_KEY, token);
      } else {
        localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      }
    } catch {
      // Ignoramos los  errores en este caso.
    }
  }

  private _setupInterceptors(): void {
    // Interceptor de solicitud
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Interceptor de respuesta
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Si el error es 401 y no se ha reintentado.
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          const newToken = await this.refreshToken();

          if (newToken) {
            // Actualizamos la cabecera con el token actualizado
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Reintentamos la solicitud original con la nueva configuración de instancia
            return this.client(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private refreshPromise: Promise<string | null> | null = null;

  private async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const response = await axios.post<{ accessToken: string }>(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = response.data.accessToken;

        this.setToken(newToken);
        return newToken;
      } catch (err) {
        this.setToken(null);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

// TODO CONFIGURAR PARA LA ENV.
const BASE_URL = 'https://life-lift-api.vercel.app/api';
export const api = new ApiClient(BASE_URL);
