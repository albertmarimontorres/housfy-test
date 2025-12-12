import http from '@/api/httpClient';
import type { AuthCredentials, RegisterPayload, AuthResponse } from '@/types/Auth';

export const authApi = {
  /**
   * Realiza el login del usuario
   */
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/login', credentials);
    return data;
  },

  /**
   * Registra un nuevo usuario
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/register', payload);
    return data;
  },
};
