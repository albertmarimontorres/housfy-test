import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useProfileStore } from '@/stores/profile.store';
import { getProfile } from '@/services/profile.service';
import type { ProfileResponse, User } from '@/types/Profile';

// Mock del servicio
vi.mock('@/services/profile.service');

describe('Profile Store', () => {
  let profileStore: ReturnType<typeof useProfileStore>;
  const mockGetProfile = getProfile as any;

  beforeEach(() => {
    // Crear nueva instancia de Pinia para cada test
    setActivePinia(createPinia());
    profileStore = useProfileStore();

    // Limpiar mocks
    vi.clearAllMocks();
  });

  describe('estado inicial', () => {
    it('debería inicializar con estado vacío', () => {
      expect(profileStore.user).toBe(null);
      expect(profileStore.loading).toBe(false);
      expect(profileStore.error).toBe(null);
    });

    it('debería tener estado reactivo', () => {
      // Verificar que el estado es reactivo
      expect(profileStore.$state).toEqual({
        user: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('action: fetchProfile', () => {
    describe('casos de éxito', () => {
      it('debería obtener perfil exitosamente', async () => {
        // Arrange
        const mockUser: User = {
          id: 123,
          email: 'test@example.com',
          fullName: 'Juan Pérez',
          createdAt: '2023-01-01T00:00:00Z',
        };

        const mockResponse: ProfileResponse = {
          success: true,
          message: 'Perfil obtenido correctamente',
          user: mockUser,
        };

        mockGetProfile.mockResolvedValue(mockResponse);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(mockGetProfile).toHaveBeenCalledTimes(1);
        expect(profileStore.user).toEqual(mockUser);
        expect(profileStore.loading).toBe(false);
        expect(profileStore.error).toBe(null);
      });

      it('debería manejar estado de loading correctamente', async () => {
        // Arrange
        let loadingDuringExecution = false;
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

        mockGetProfile.mockImplementation(async () => {
          loadingDuringExecution = profileStore.loading;
          return mockResponse;
        });

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(loadingDuringExecution).toBe(true);
        expect(profileStore.loading).toBe(false);
      });

      it('debería limpiar error previo al iniciar fetch', async () => {
        // Arrange
        profileStore.error = 'Error previo';

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

        mockGetProfile.mockResolvedValue(mockResponse);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.error).toBe(null);
      });

      it('debería actualizar solo el usuario cuando la respuesta es válida', async () => {
        // Arrange
        const mockUser: User = {
          id: 456,
          email: 'nuevo@example.com',
          fullName: 'Usuario Nuevo',
          createdAt: '2023-06-01T00:00:00Z',
        };

        const mockResponse: ProfileResponse = {
          success: true,
          message: 'Perfil actualizado',
          user: mockUser,
        };

        mockGetProfile.mockResolvedValue(mockResponse);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.user).toEqual(mockUser);
        expect(profileStore.user?.id).toBe(456);
        expect(profileStore.user?.email).toBe('nuevo@example.com');
      });
    });

    describe('casos de respuesta sin usuario', () => {
      it('debería manejar respuesta sin usuario', async () => {
        // Arrange
        const mockResponse = {
          success: true,
          message: 'Sin datos de usuario',
          user: null,
        };

        mockGetProfile.mockResolvedValue(mockResponse);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.user).toBe(null);
        expect(profileStore.error).toBe('Sin datos de usuario');
        expect(profileStore.loading).toBe(false);
      });

      it('debería manejar respuesta undefined', async () => {
        // Arrange
        mockGetProfile.mockResolvedValue(undefined);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.user).toBe(null);
        expect(profileStore.error).toBe('No se pudo obtener el perfil');
        expect(profileStore.loading).toBe(false);
      });

      it('debería manejar respuesta null', async () => {
        // Arrange
        mockGetProfile.mockResolvedValue(null);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.user).toBe(null);
        expect(profileStore.error).toBe('No se pudo obtener el perfil');
        expect(profileStore.loading).toBe(false);
      });

      it('debería usar mensaje de respuesta cuando no hay usuario', async () => {
        // Arrange
        const mockResponse = {
          success: true,
          message: 'Usuario no disponible temporalmente',
          user: undefined,
        };

        mockGetProfile.mockResolvedValue(mockResponse);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.error).toBe('Usuario no disponible temporalmente');
      });
    });

    describe('casos de error del servicio', () => {
      it('debería manejar error con response.data.message', async () => {
        // Arrange
        const error = {
          response: {
            data: {
              message: 'Error del servidor',
            },
          },
        };
        mockGetProfile.mockRejectedValue(error);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.user).toBe(null);
        expect(profileStore.error).toBe('Error del servidor');
        expect(profileStore.loading).toBe(false);
      });

      it('debería usar mensaje por defecto si no hay error específico', async () => {
        // Arrange
        const error = new Error('Generic error');
        mockGetProfile.mockRejectedValue(error);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.user).toBe(null);
        expect(profileStore.error).toBe('Error al obtener el perfil');
        expect(profileStore.loading).toBe(false);
      });

      it('debería manejar error sin response', async () => {
        // Arrange
        const error = { message: 'Network error' };
        mockGetProfile.mockRejectedValue(error);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.error).toBe('Error al obtener el perfil');
      });

      it('debería manejar error null', async () => {
        // Arrange
        mockGetProfile.mockRejectedValue(null);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.error).toBe('Error al obtener el perfil');
      });

      it('debería manejar error undefined', async () => {
        // Arrange
        mockGetProfile.mockRejectedValue(undefined);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.error).toBe('Error al obtener el perfil');
      });

      it('debería manejar error string', async () => {
        // Arrange
        mockGetProfile.mockRejectedValue('String error');

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.error).toBe('Error al obtener el perfil');
      });
    });

    describe('edge cases', () => {
      it('debería manejar múltiples llamadas concurrentes', async () => {
        // Arrange
        const mockResponse: ProfileResponse = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            email: 'concurrent@test.com',
            fullName: 'Concurrent User',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        mockGetProfile.mockResolvedValue(mockResponse);

        // Act
        const promises = [
          profileStore.fetchProfile(),
          profileStore.fetchProfile(),
          profileStore.fetchProfile(),
        ];

        await Promise.all(promises);

        // Assert
        expect(mockGetProfile).toHaveBeenCalledTimes(3);
        expect(profileStore.user?.id).toBe(1);
        expect(profileStore.loading).toBe(false);
      });

      it('debería mantener estado consistente después de error', async () => {
        // Arrange
        const error = new Error('Test error');
        mockGetProfile.mockRejectedValue(error);

        // Act
        await profileStore.fetchProfile();

        // Assert
        expect(profileStore.user).toBe(null);
        expect(profileStore.loading).toBe(false);
        expect(profileStore.error).toBe('Error al obtener el perfil');
      });
    });
  });

  describe('action: clearProfile', () => {
    it('debería limpiar el perfil y error', () => {
      // Arrange - Establecer estado inicial
      profileStore.user = {
        id: 123,
        email: 'test@example.com',
        fullName: 'Test User',
        createdAt: '2023-01-01T00:00:00Z',
      };
      profileStore.error = 'Some error';

      // Act
      profileStore.clearProfile();

      // Assert
      expect(profileStore.user).toBe(null);
      expect(profileStore.error).toBe(null);
    });

    it('debería no afectar el estado loading', () => {
      // Arrange
      profileStore.loading = true;
      profileStore.user = {
        id: 123,
        email: 'test@example.com',
        fullName: 'Test User',
        createdAt: '2023-01-01T00:00:00Z',
      };

      // Act
      profileStore.clearProfile();

      // Assert
      expect(profileStore.loading).toBe(true); // No debería cambiar
      expect(profileStore.user).toBe(null);
    });

    it('debería funcionar aunque ya esté limpio', () => {
      // Arrange - Estado ya limpio
      expect(profileStore.user).toBe(null);
      expect(profileStore.error).toBe(null);

      // Act
      profileStore.clearProfile();

      // Assert - Debería seguir limpio
      expect(profileStore.user).toBe(null);
      expect(profileStore.error).toBe(null);
    });
  });

  describe('integración completa', () => {
    it('debería manejar flujo completo fetch -> clear', async () => {
      // Arrange
      const mockResponse: ProfileResponse = {
        success: true,
        message: 'OK',
        user: {
          id: 123,
          email: 'integration@test.com',
          fullName: 'Integration User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      mockGetProfile.mockResolvedValue(mockResponse);

      // Act - Fetch
      await profileStore.fetchProfile();

      // Assert - Después de fetch
      expect(profileStore.user).not.toBe(null);
      expect(profileStore.user?.id).toBe(123);

      // Act - Clear
      profileStore.clearProfile();

      // Assert - Después de clear
      expect(profileStore.user).toBe(null);
      expect(profileStore.error).toBe(null);
    });

    it('debería mantener independencia entre instancias de store', () => {
      // Arrange
      const secondStore = useProfileStore();

      // Act
      profileStore.user = {
        id: 1,
        email: 'test1@example.com',
        fullName: 'Test User 1',
        createdAt: '2023-01-01T00:00:00Z',
      };

      // Assert - Ambos stores comparten el mismo estado (Pinia singleton)
      expect(secondStore.user).toBe(profileStore.user);
    });

    it('debería recuperar estado después de error y nuevo fetch exitoso', async () => {
      // Arrange
      const error = new Error('First error');
      const successResponse: ProfileResponse = {
        success: true,
        message: 'Recovery successful',
        user: {
          id: 456,
          email: 'recovery@test.com',
          fullName: 'Recovery User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      // Act - Error
      mockGetProfile.mockRejectedValueOnce(error);
      await profileStore.fetchProfile();

      // Assert - Estado de error
      expect(profileStore.error).toBe('Error al obtener el perfil');
      expect(profileStore.user).toBe(null);

      // Act - Recuperación
      mockGetProfile.mockResolvedValueOnce(successResponse);
      await profileStore.fetchProfile();

      // Assert - Estado recuperado
      expect(profileStore.error).toBe(null);
      expect(profileStore.user?.id).toBe(456);
      expect(profileStore.user?.fullName).toBe('Recovery User');
    });
  });
});
