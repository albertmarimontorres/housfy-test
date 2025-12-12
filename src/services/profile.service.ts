import { profileApi } from '@/api/modules/profile.api';
import type { ProfileResponse } from '@/types/Profile';

/**
 * Valida la respuesta del perfil
 */
const validateProfileResponse = (response: ProfileResponse): void => {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('Respuesta del perfil inválida');
  }

  if (response.success === false) {
    throw new Error(response.message || 'Error al obtener el perfil');
  }
};

export const ProfileService = {
  /**
   * Obtiene el perfil del usuario con validación y manejo de errores
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const profileResponse = await profileApi.getProfile();

      // Early return para validación
      validateProfileResponse(profileResponse);

      return profileResponse;
    } catch (error) {
      // Re-lanzar error personalizado si es conocido
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Error desconocido al obtener el perfil');
    }
  },
};

// Mantener compatibilidad con la función exportada anterior
export const getProfile = ProfileService.getProfile;
