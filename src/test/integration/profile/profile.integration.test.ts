import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useProfileStore } from '@/stores/profile.store';
import { ProfileService } from '@/services/profile.service';
import { profileApi } from '@/api/modules/profile.api';
import type { ProfileResponse, User } from '@/types/Profile';

// Mock de todas las dependencias
vi.mock('@/services/profile.service');
vi.mock('@/api/modules/profile.api');

describe('Profile Integration Tests', () => {
  let profileStore: ReturnType<typeof useProfileStore>;
  const mockProfileService = ProfileService as any;
  const mockProfileApi = profileApi as any;

  beforeEach(() => {
    // Crear nueva instancia de Pinia
    setActivePinia(createPinia());
    profileStore = useProfileStore();

    // Limpiar todos los mocks
    vi.clearAllMocks();
  });

  describe('flujo completo: Store → Service → API', () => {
    it('debería completar flujo exitoso de obtención de perfil', async () => {
      // Arrange
      const mockUser: User = {
        id: 123,
        email: 'integration@example.com',
        fullName: 'Usuario Integración',
        createdAt: '2023-01-01T00:00:00Z',
      };

      const mockApiResponse: ProfileResponse = {
        success: true,
        message: 'Perfil obtenido correctamente',
        user: mockUser,
      };

      // Mock de la cadena: API → Service → Store
      mockProfileApi.getProfile.mockResolvedValue(mockApiResponse);
      mockProfileService.getProfile.mockResolvedValue(mockApiResponse);

      // Act
      await profileStore.fetchProfile();

      // Assert - Verificar llamadas en cadena
      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(1);

      // Assert - Verificar estado final del store
      expect(profileStore.user).toEqual(mockUser);
      expect(profileStore.loading).toBe(false);
      expect(profileStore.error).toBe(null);
    });

    it('debería propagar errores de API a través de Service hasta Store', async () => {
      // Arrange
      const apiError = new Error('API Error: 500 Internal Server Error');

      // Mock error en toda la cadena
      mockProfileApi.getProfile.mockRejectedValue(apiError);
      mockProfileService.getProfile.mockRejectedValue(apiError);

      // Act
      await profileStore.fetchProfile();

      // Assert - Verificar que el error se propaga
      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(1);
      expect(profileStore.user).toBe(null);
      expect(profileStore.error).toBe('Error al obtener el perfil');
      expect(profileStore.loading).toBe(false);
    });

    it('debería manejar respuesta de API con success=false', async () => {
      // Arrange
      const failureResponse = {
        success: false,
        message: 'Usuario no autorizado',
        user: null,
      };

      const serviceError = new Error('Usuario no autorizado');

      // Mock API devuelve respuesta de fallo
      mockProfileApi.getProfile.mockResolvedValue(failureResponse);
      // Service transforma en error (según su lógica de validación)
      mockProfileService.getProfile.mockRejectedValue(serviceError);

      // Act
      await profileStore.fetchProfile();

      // Assert
      expect(profileStore.user).toBe(null);
      expect(profileStore.error).toBe('Error al obtener el perfil');
    });
  });

  describe('integración con estados de loading', () => {
    it('debería manejar loading state durante toda la cadena', async () => {
      // Arrange
      const loadingStates: boolean[] = [];

      const mockResponse: ProfileResponse = {
        success: true,
        message: 'OK',
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      // Mock que simula delay y captura estados de loading
      mockProfileService.getProfile.mockImplementation(async () => {
        loadingStates.push(profileStore.loading); // Debería ser true
        await new Promise(resolve => setTimeout(resolve, 10)); // Simular delay
        loadingStates.push(profileStore.loading); // Debería seguir siendo true
        return mockResponse;
      });

      // Act
      const fetchPromise = profileStore.fetchProfile();
      loadingStates.push(profileStore.loading); // Inmediatamente después de llamar

      await fetchPromise;
      loadingStates.push(profileStore.loading); // Después de completar

      // Assert
      expect(loadingStates).toEqual([true, true, true, false]);
    });

    it('debería manejar loading correctamente incluso con errores', async () => {
      // Arrange
      const error = new Error('Test error');
      let loadingDuringError = false;

      mockProfileService.getProfile.mockImplementation(async () => {
        loadingDuringError = profileStore.loading;
        throw error;
      });

      // Act
      await profileStore.fetchProfile();

      // Assert
      expect(loadingDuringError).toBe(true);
      expect(profileStore.loading).toBe(false); // Se debe limpiar después del error
    });
  });

  describe('integración de manejo de errores', () => {
    it('debería manejar error de red en API', async () => {
      // Arrange
      const networkError = {
        response: {
          data: {
            message: 'Error de conexión',
          },
        },
      };

      mockProfileService.getProfile.mockRejectedValue(networkError);

      // Act
      await profileStore.fetchProfile();

      // Assert
      expect(profileStore.error).toBe('Error de conexión');
      expect(profileStore.user).toBe(null);
    });

    it('debería manejar timeout de API', async () => {
      // Arrange
      const timeoutError = new Error('Request timeout');
      mockProfileService.getProfile.mockRejectedValue(timeoutError);

      // Act
      await profileStore.fetchProfile();

      // Assert
      expect(profileStore.error).toBe('Error al obtener el perfil');
    });

    it('debería limpiar errores previos en nueva llamada exitosa', async () => {
      // Arrange
      const firstError = new Error('First error');
      const successResponse: ProfileResponse = {
        success: true,
        message: 'Recovery successful',
        user: {
          id: 123,
          email: 'recovery@example.com',
          fullName: 'Recovery User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      // Act - Primera llamada con error
      mockProfileService.getProfile.mockRejectedValueOnce(firstError);
      await profileStore.fetchProfile();

      // Assert - Estado de error
      expect(profileStore.error).toBe('Error al obtener el perfil');
      expect(profileStore.user).toBe(null);

      // Act - Segunda llamada exitosa
      mockProfileService.getProfile.mockResolvedValueOnce(successResponse);
      await profileStore.fetchProfile();

      // Assert - Error limpiado
      expect(profileStore.error).toBe(null);
      expect(profileStore.user?.id).toBe(123);
    });
  });

  describe('integración con ciclo de vida completo', () => {
    it('debería manejar fetch → clear → fetch', async () => {
      // Arrange
      const user1: User = {
        id: 1,
        email: 'user1@example.com',
        fullName: 'First User',
        createdAt: '2023-01-01T00:00:00Z',
      };

      const user2: User = {
        id: 2,
        email: 'user2@example.com',
        fullName: 'Second User',
        createdAt: '2023-02-01T00:00:00Z',
      };

      const response1: ProfileResponse = {
        success: true,
        message: 'First fetch',
        user: user1,
      };

      const response2: ProfileResponse = {
        success: true,
        message: 'Second fetch',
        user: user2,
      };

      // Act - Primera obtención
      mockProfileService.getProfile.mockResolvedValueOnce(response1);
      await profileStore.fetchProfile();

      // Assert - Primer estado
      expect(profileStore.user?.id).toBe(1);

      // Act - Limpiar
      profileStore.clearProfile();

      // Assert - Estado limpio
      expect(profileStore.user).toBe(null);
      expect(profileStore.error).toBe(null);

      // Act - Segunda obtención
      mockProfileService.getProfile.mockResolvedValueOnce(response2);
      await profileStore.fetchProfile();

      // Assert - Nuevo estado
      expect(profileStore.user?.id).toBe(2);
      expect(profileStore.user?.fullName).toBe('Second User');
    });

    it('debería mantener independencia entre múltiples operaciones', async () => {
      // Arrange
      const responses = [
        {
          success: true,
          message: 'Call 1',
          user: {
            id: 1,
            email: 'user1@test.com',
            fullName: 'User 1',
            createdAt: '2023-01-01T00:00:00Z',
          },
        },
        {
          success: true,
          message: 'Call 2',
          user: {
            id: 2,
            email: 'user2@test.com',
            fullName: 'User 2',
            createdAt: '2023-01-02T00:00:00Z',
          },
        },
        {
          success: true,
          message: 'Call 3',
          user: {
            id: 3,
            email: 'user3@test.com',
            fullName: 'User 3',
            createdAt: '2023-01-03T00:00:00Z',
          },
        },
      ];

      // Mock para devolver respuestas secuencialmente
      mockProfileService.getProfile
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2]);

      // Act - Múltiples llamadas
      await profileStore.fetchProfile();
      const firstUser = profileStore.user;

      await profileStore.fetchProfile();
      const secondUser = profileStore.user;

      await profileStore.fetchProfile();
      const thirdUser = profileStore.user;

      // Assert - Cada llamada actualiza correctamente
      expect(firstUser?.id).toBe(1);
      expect(secondUser?.id).toBe(2);
      expect(thirdUser?.id).toBe(3);
      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(3);
    });
  });

  describe('casos edge de integración', () => {
    it('debería manejar llamadas concurrentes sin problemas', async () => {
      // Arrange
      const response: ProfileResponse = {
        success: true,
        message: 'Concurrent response',
        user: {
          id: 999,
          email: 'concurrent@example.com',
          fullName: 'Concurrent User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      mockProfileService.getProfile.mockResolvedValue(response);

      // Act - Llamadas concurrentes
      const promises = [
        profileStore.fetchProfile(),
        profileStore.fetchProfile(),
        profileStore.fetchProfile(),
      ];

      await Promise.all(promises);

      // Assert
      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(3);
      expect(profileStore.user?.id).toBe(999);
      expect(profileStore.loading).toBe(false);
    });

    it('debería manejar mix de éxito y error en llamadas consecutivas', async () => {
      // Arrange
      const error = new Error('Temporary error');
      const successResponse: ProfileResponse = {
        success: true,
        message: 'Success after error',
        user: {
          id: 456,
          email: 'success@example.com',
          fullName: 'Success User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      // Act & Assert - Error primero
      mockProfileService.getProfile.mockRejectedValueOnce(error);
      await profileStore.fetchProfile();
      expect(profileStore.error).toBeTruthy();
      expect(profileStore.user).toBe(null);

      // Act & Assert - Éxito después
      mockProfileService.getProfile.mockResolvedValueOnce(successResponse);
      await profileStore.fetchProfile();
      expect(profileStore.error).toBe(null);
      expect(profileStore.user?.id).toBe(456);
    });

    it('debería mantener consistencia de estado durante operaciones rápidas', async () => {
      // Arrange
      const quickResponse: ProfileResponse = {
        success: true,
        message: 'Quick response',
        user: {
          id: 123,
          email: 'quick@example.com',
          fullName: 'Quick User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      // Mock sin delay para operación "instantánea"
      mockProfileService.getProfile.mockResolvedValue(quickResponse);

      // Act - Operación rápida
      await profileStore.fetchProfile();

      // Assert - Estado consistente
      expect(profileStore.loading).toBe(false);
      expect(profileStore.user).toBeTruthy();
      expect(profileStore.error).toBe(null);
    });
  });
});
