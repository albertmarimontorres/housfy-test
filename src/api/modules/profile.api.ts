import http from '@/api/httpClient';
import type { ProfileResponse } from '@/types/Profile';

export const profileApi = {
  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await http.get<ProfileResponse>('/profile');
    
    // Handle edge cases where response might not have expected structure
    if (!response) {
      throw new Error('No response received from server');
    }
    
    if (!response.hasOwnProperty('data')) {
      throw new Error('Invalid response structure');
    }
    
    return response.data;
  },
};