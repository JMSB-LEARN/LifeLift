import { api } from './ApiClient';

// Define the shape of your User object
export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  surname?: string;
  second_surname?: string;
  name?: string;
  created_at?: string;
  // Add other user fields here
}

// Define the expected response from the login endpoint
interface LoginResponse {
  token: string;
  user?: User;
}

// Define the expected response from the register endpoint
interface RegisterResponse {
  message: string;
  user: User & { created_at?: string };
}

// Define the registration payload
interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  surname: string;
  second_surname?: string | null;
}

class AuthService {
  private currentUser: User | null = null;

  /**
   * Authenticates the user and sets the access token in memory
   */
  async login(username: string, password: string): Promise<void> {
    const { data } = await api.client.post<LoginResponse>('/login', { 
      username, 
      password 
    });

    // Store the token in the ApiClient instance memory
    api.setToken(data.token);
    
    // Store user info if provided in response
    if (data.user) {
      this.currentUser = data.user;
    }
  }

  /**
   * Registers a new user with the provided information
   */
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.client.post<RegisterResponse>('/register', payload);
    return data.user;
  }

  /**
   * Gets the current logged-in user (from memory, no API call)
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Checks if a user is currently logged in
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Logs out the user and clears the token from memory
   */
  async logout(): Promise<void> {
    try {
      await api.client.post('/logout');
    } finally {
      // We clear the token even if the request fails 
      // to ensure the client-side session is closed.
      api.setToken(null);
      this.currentUser = null;
    }
  }

  /**
   * Retrieves the current user's profile
   */
  async getProfile(): Promise<User> {
    const { data } = await api.client.get<User>('/me');
    return data;
  }
}

// Export a single instance to maintain a consistent state across the app
export default new AuthService();