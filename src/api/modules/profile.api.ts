import http from '@/api/httpClient';
import type { ProfileResponse } from '@/types/Profile';

export const profileApi = {
  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(): Promise<ProfileResponse> {
    const { data } = await http.get<ProfileResponse>('/profile');
    return data;
  },
};