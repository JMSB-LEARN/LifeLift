import { api } from './ApiClient';
import { User, DocumentTypeEnum } from './models';

// Expor User para que las importaciones existentes en los componentes no se rompan.
export type { User };

// Definicion de la respuesta esperada del endpoint de inicio de sesión.
interface LoginResponse {
  token: string;
  user?: User;
}

// Definicion de la respuesta esperada del endpoint de registro.
interface RegisterResponse {
  message: string;
  user: User;
}

// Definicion de la carga útil de registro.
interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  surname_1: string;
  surname_2?: string | null;
  document_number: string;
  document_type?: DocumentTypeEnum;
  birth_date: string;
}

class AuthService {
  private currentUser: User | null = null;
  private readonly USER_STORAGE_KEY = 'lifeLiftUser';

  constructor() {
    const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser) as User;
      } catch {
        this.currentUser = null;
      }
    }
  }

  /**
   * Autentica al usuario y establece el token de acceso en memoria.
   */
  async login(username: string, password: string): Promise<void> {
    const { data } = await api.client.post<LoginResponse>('/login', {
      username,
      password
    });

    // Guardamos el token en la instancia ApiClient.
    api.setToken(data.token);

    // Guardamos la información del usuario si se proporciona en la respuesta.
    if (data.user) {
      this.currentUser = data.user;
      try {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {
        // Ignoramos los errores en este caso.
      }
    }
  }


  //Registra un nuevo usuario con la información proporcionada.

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.client.post<RegisterResponse>('/register', payload);
    return data.user;
  }


  //Obtiene el usuario actual logueado.
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  //Verifica si un usuario está actualmente logueado.
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Verifica si el usuario actual es administrador
  isAdmin(): boolean {
    return this.currentUser?.is_admin === true;
  }

  // Hacer al usuario actual administrador (solo para pruebas)
  async makeMeAdmin(): Promise<void> {
    const { data } = await api.client.post('/make-me-admin');
    if (this.currentUser && data.user) {
      this.currentUser.is_admin = data.user.is_admin;
      try {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.currentUser));
      } catch {
        // Ignorar
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await api.client.post('/logout');
    } finally {
      // Borramos el token incluso si la solicitud falla y así asegurar que la sesión del lado del cliente está cerrada.
      api.setToken(null);
      this.currentUser = null;
      try {
        localStorage.removeItem(this.USER_STORAGE_KEY);
      } catch {
        // Ignoramos los errores en este caso.
      }
      // Volver a inicio y recargar para liberar memoria
      window.location.href = '/';
    }
  }

  //Obtiene el perfil del usuario actual.
  async getProfile(): Promise<any> {
    const { data } = await api.client.get<any>('/profile');
    return data;
  }

  //Cambia la contraseña del usuario actual.
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.client.put('/change-password', {
      currentPassword,
      newPassword
    });
  }
}

// Exportamos una única instancia para mantener un estado consistente en toda la aplicación.
export default new AuthService();