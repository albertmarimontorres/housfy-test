import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { profileApi } from '@/api/modules/profile.api';
import http from '@/api/httpClient';
import type { ProfileResponse } from '@/types/Profile';

// Mock del httpClient
vi.mock('@/api/httpClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Profile API', () => {
  const mockHttp = http as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProfile', () => {
    describe('casos de éxito', () => {
      it('debería obtener perfil exitosamente', async () => {
        // Arrange
        const mockProfileResponse: ProfileResponse = {
          success: true,
          message: 'Perfil obtenido correctamente',
          user: {
            id: 123,
            email: 'test@example.com',
            fullName: 'Juan Pérez',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        mockHttp.get.mockResolvedValue({ data: mockProfileResponse });

        // Act
        const result = await profileApi.getProfile();

        // Assert
        expect(mockHttp.get).toHaveBeenCalledWith('/profile');
        expect(result).toEqual(mockProfileResponse);
        expect(result.success).toBe(true);
        expect(result.user.id).toBe(123);
        expect(result.user.email).toBe('test@example.com');
        expect(result.user.fullName).toBe('Juan Pérez');
      });

      it('debería manejar respuesta con usuario mínimo', async () => {
        // Arrange
        const mockMinimalResponse: ProfileResponse = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            email: 'minimal@test.com',
            fullName: 'Min User',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        mockHttp.get.mockResolvedValue({ data: mockMinimalResponse });

        // Act
        const result = await profileApi.getProfile();

        // Assert
        expect(result).toEqual(mockMinimalResponse);
        expect(result.user.id).toBe(1);
      });

      it('debería hacer request con headers correctos', async () => {
        // Arrange
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

        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        await profileApi.getProfile();

        // Assert
        expect(mockHttp.get).toHaveBeenCalledTimes(1);
        expect(mockHttp.get).toHaveBeenCalledWith('/profile');
      });
    });

    describe('casos de error', () => {
      it('debería manejar error 401 - No autorizado', async () => {
        // Arrange
        const error = {
          response: {
            status: 401,
            data: { message: 'Token expirado' },
          },
        };
        mockHttp.get.mockRejectedValue(error);

        // Act & Assert
        await expect(profileApi.getProfile()).rejects.toEqual(error);
        expect(mockHttp.get).toHaveBeenCalledWith('/profile');
      });

      it('debería manejar error 404 - Perfil no encontrado', async () => {
        // Arrange
        const error = {
          response: {
            status: 404,
            data: { message: 'Perfil no encontrado' },
          },
        };
        mockHttp.get.mockRejectedValue(error);

        // Act & Assert
        await expect(profileApi.getProfile()).rejects.toEqual(error);
      });

      it('debería manejar error 500 - Error interno del servidor', async () => {
        // Arrange
        const error = {
          response: {
            status: 500,
            data: { message: 'Error interno del servidor' },
          },
        };
        mockHttp.get.mockRejectedValue(error);

        // Act & Assert
        await expect(profileApi.getProfile()).rejects.toEqual(error);
      });

      it('debería manejar error de red/timeout', async () => {
        // Arrange
        const networkError = new Error('Network Error');
        mockHttp.get.mockRejectedValue(networkError);

        // Act & Assert
        await expect(profileApi.getProfile()).rejects.toThrow('Network Error');
      });

      it('debería manejar error cuando http.get retorna undefined', async () => {
        // Arrange
        mockHttp.get.mockResolvedValue(undefined);

        // Act & Assert
        await expect(profileApi.getProfile()).rejects.toThrow('No response received from server');
      });
    });

    describe('edge cases', () => {
      it('debería manejar respuesta con data null', async () => {
        // Arrange
        mockHttp.get.mockResolvedValue({ data: null });

        // Act
        const result = await profileApi.getProfile();

        // Assert
        expect(result).toBe(null);
      });

      it('debería manejar respuesta vacía', async () => {
        // Arrange
        mockHttp.get.mockResolvedValue({});

        // Act & Assert
        await expect(profileApi.getProfile()).rejects.toThrow('Invalid response structure');
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

        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        const promises = [
          profileApi.getProfile(),
          profileApi.getProfile(),
          profileApi.getProfile(),
        ];

        const results = await Promise.all(promises);

        // Assert
        expect(mockHttp.get).toHaveBeenCalledTimes(3);
        results.forEach(result => {
          expect(result).toEqual(mockResponse);
        });
      });
    });

    describe('validación de tipos', () => {
      it('debería manejar respuesta con tipos incorrectos', async () => {
        // Arrange
        const malformedResponse = {
          success: 'true', // string en lugar de boolean
          message: 123, // number en lugar de string
          user: 'invalid', // string en lugar de objeto
        };

        mockHttp.get.mockResolvedValue({ data: malformedResponse });

        // Act
        const result = await profileApi.getProfile();

        // Assert - La API no valida tipos, solo devuelve lo que recibe
        expect(result).toEqual(malformedResponse);
      });

      it('debería manejar user con campos faltantes', async () => {
        // Arrange
        const incompleteResponse = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            // email, fullName, createdAt faltantes
          },
        };

        mockHttp.get.mockResolvedValue({ data: incompleteResponse });

        // Act
        const result = await profileApi.getProfile();

        // Assert
        expect(result).toEqual(incompleteResponse);
        expect(result.user.id).toBe(1);
      });
    });
  });

  describe('integración con httpClient', () => {
    it('debería usar el cliente HTTP correcto', () => {
      // Arrange & Act & Assert
      expect(profileApi.getProfile).toBeDefined();
      expect(typeof profileApi.getProfile).toBe('function');
    });

    it('debería hacer request al endpoint correcto', async () => {
      // Arrange
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

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await profileApi.getProfile();

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/profile');
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
    });
  });
});
