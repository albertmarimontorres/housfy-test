import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '@/services/profile.service';
import { profileApi } from '@/api/modules/profile.api';
import type { ProfileResponse } from '@/types/Profile';

// Mock de la API
vi.mock('@/api/modules/profile.api');

describe('Profile Service', () => {
  const mockProfileApi = profileApi as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    describe('casos de éxito', () => {
      it('debería obtener perfil exitosamente', async () => {
        // Arrange
        const mockResponse: ProfileResponse = {
          success: true,
          message: 'Perfil obtenido correctamente',
          user: {
            id: 123,
            email: 'test@example.com',
            fullName: 'Juan Pérez',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        mockProfileApi.getProfile.mockResolvedValue(mockResponse);

        // Act
        const result = await ProfileService.getProfile();

        // Assert
        expect(mockProfileApi.getProfile).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockResponse);
        expect(result.success).toBe(true);
        expect(result.user.fullName).toBe('Juan Pérez');
      });

      it('debería pasar validación con respuesta válida', async () => {
        // Arrange
        const validResponse: ProfileResponse = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            email: 'valid@test.com',
            fullName: 'Valid User',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        mockProfileApi.getProfile.mockResolvedValue(validResponse);

        // Act & Assert
        await expect(ProfileService.getProfile()).resolves.toEqual(validResponse);
      });

      it('debería manejar mensaje personalizado en respuesta exitosa', async () => {
        // Arrange
        const responseWithMessage: ProfileResponse = {
          success: true,
          message: 'Perfil actualizado recientemente',
          user: {
            id: 456,
            email: 'updated@test.com',
            fullName: 'Updated User',
            createdAt: '2023-06-01T00:00:00Z',
          },
        };

        mockProfileApi.getProfile.mockResolvedValue(responseWithMessage);

        // Act
        const result = await ProfileService.getProfile();

        // Assert
        expect(result.message).toBe('Perfil actualizado recientemente');
        expect(result.user.id).toBe(456);
      });
    });

    describe('casos de validación de respuesta', () => {
      it('debería fallar si success es false', async () => {
        // Arrange
        const failureResponse: ProfileResponse = {
          success: false,
          message: 'Usuario no encontrado',
          user: {
            id: 0,
            email: '',
            fullName: '',
            createdAt: '',
          },
        };

        mockProfileApi.getProfile.mockResolvedValue(failureResponse);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Usuario no encontrado');
      });

      it('debería fallar si success es false sin mensaje', async () => {
        // Arrange
        const failureWithoutMessage = {
          success: false,
          message: '',
          user: {
            id: 0,
            email: '',
            fullName: '',
            createdAt: '',
          },
        };

        mockProfileApi.getProfile.mockResolvedValue(failureWithoutMessage);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Error al obtener el perfil');
      });

      it('debería fallar si la respuesta es null', async () => {
        // Arrange
        mockProfileApi.getProfile.mockResolvedValue(null);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Respuesta del perfil inválida');
      });

      it('debería fallar si la respuesta es undefined', async () => {
        // Arrange
        mockProfileApi.getProfile.mockResolvedValue(undefined);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Respuesta del perfil inválida');
      });

      it('debería fallar si la respuesta no es un objeto', async () => {
        // Arrange
        mockProfileApi.getProfile.mockResolvedValue('invalid response');

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Respuesta del perfil inválida');
      });

      it('debería fallar si la respuesta es un array', async () => {
        // Arrange
        mockProfileApi.getProfile.mockResolvedValue([]);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Respuesta del perfil inválida');
      });
    });

    describe('casos de error de API', () => {
      it('debería re-lanzar errores conocidos de API', async () => {
        // Arrange
        const apiError = new Error('Error de conexión');
        mockProfileApi.getProfile.mockRejectedValue(apiError);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Error de conexión');
      });

      it('debería manejar errores HTTP específicos', async () => {
        // Arrange
        const httpError = new Error('HTTP 404: Not Found');
        mockProfileApi.getProfile.mockRejectedValue(httpError);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('HTTP 404: Not Found');
      });

      it('debería manejar errores de red', async () => {
        // Arrange
        const networkError = new Error('Network timeout');
        mockProfileApi.getProfile.mockRejectedValue(networkError);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Network timeout');
      });

      it('debería manejar errores desconocidos', async () => {
        // Arrange
        mockProfileApi.getProfile.mockRejectedValue('Unknown error type');

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow(
          'Error desconocido al obtener el perfil'
        );
      });

      it('debería manejar errores null', async () => {
        // Arrange
        mockProfileApi.getProfile.mockRejectedValue(null);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow(
          'Error desconocido al obtener el perfil'
        );
      });

      it('debería manejar errores undefined', async () => {
        // Arrange
        mockProfileApi.getProfile.mockRejectedValue(undefined);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow(
          'Error desconocido al obtener el perfil'
        );
      });
    });

    describe('edge cases', () => {
      it('debería manejar respuesta con campos adicionales', async () => {
        // Arrange
        const responseWithExtra = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            createdAt: '2023-01-01T00:00:00Z',
          },
          extraField: 'should be ignored',
          metadata: { version: '1.0' },
        };

        mockProfileApi.getProfile.mockResolvedValue(responseWithExtra);

        // Act
        const result = await ProfileService.getProfile();

        // Assert
        expect(result).toEqual(responseWithExtra);
        expect((result as any).extraField).toBe('should be ignored');
      });

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

        mockProfileApi.getProfile.mockResolvedValue(mockResponse);

        // Act
        const promises = [
          ProfileService.getProfile(),
          ProfileService.getProfile(),
          ProfileService.getProfile(),
        ];

        const results = await Promise.all(promises);

        // Assert
        expect(mockProfileApi.getProfile).toHaveBeenCalledTimes(3);
        results.forEach(result => {
          expect(result).toEqual(mockResponse);
        });
      });

      it('debería manejar respuesta con success como string "true"', async () => {
        // Arrange
        const responseWithStringSuccess = {
          success: 'true', // string instead of boolean
          message: 'OK',
          user: {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        mockProfileApi.getProfile.mockResolvedValue(responseWithStringSuccess);

        // Act
        const result = await ProfileService.getProfile();

        // Assert - El servicio no valida tipos específicos, solo truthiness
        expect(result).toEqual(responseWithStringSuccess);
      });
    });

    describe('validación de estructura', () => {
      it('debería validar que la respuesta tiene estructura básica', async () => {
        // Arrange
        const incompleteResponse = {
          // success missing
          message: 'Some message',
          // user missing
        };

        mockProfileApi.getProfile.mockResolvedValue(incompleteResponse);

        // Act - El servicio acepta respuestas incompletas si success no es false
        const result = await ProfileService.getProfile();

        // Assert
        expect(result).toEqual(incompleteResponse);
      });

      it('debería rechazar respuestas con success explícitamente false', async () => {
        // Arrange
        const explicitFailure = {
          success: false,
          message: 'Explicit failure',
        };

        mockProfileApi.getProfile.mockResolvedValue(explicitFailure);

        // Act & Assert
        await expect(ProfileService.getProfile()).rejects.toThrow('Explicit failure');
      });
    });

    describe('compatibilidad con función exportada', () => {
      it('debería tener getProfile exportado como función', async () => {
        // Act & Assert
        const { getProfile } = await import('@/services/profile.service');
        expect(typeof getProfile).toBe('function');
        expect(getProfile).toBe(ProfileService.getProfile);
      });
    });
  });

  describe('validateProfileResponse - función interna', () => {
    // Estos tests verifican indirectamente la validación interna
    it('debería validar respuestas exitosas', async () => {
      // Arrange
      const validResponse: ProfileResponse = {
        success: true,
        message: 'OK',
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      mockProfileApi.getProfile.mockResolvedValue(validResponse);

      // Act & Assert - No debe lanzar error
      await expect(ProfileService.getProfile()).resolves.toBeDefined();
    });

    it('debería invalidar respuestas con success false', async () => {
      // Arrange
      const invalidResponse = {
        success: false,
        message: 'Custom error message',
        user: null,
      };

      mockProfileApi.getProfile.mockResolvedValue(invalidResponse);

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Custom error message');
    });
  });
});
