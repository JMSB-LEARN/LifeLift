import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig, 
  AxiosResponse 
} from 'axios';


// Extend the InternalAxiosRequestConfig to include our custom flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  public client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      withCredentials: false,
    });

    this._setupInterceptors();
  }

  public setToken(token: string | null): void {
    this.accessToken = token;
  }

  private _setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          const newToken = await this.refreshToken();
          
          if (newToken) {
            // Update the header with the fresh token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Retry the original request with the new instance config
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

// Accessing the variable from environme
const BASE_URL = 'https://life-lift-api.vercel.app/api';
export const api = new ApiClient(BASE_URL);
