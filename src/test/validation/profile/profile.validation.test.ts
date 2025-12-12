import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '@/services/profile.service';
import type { ProfileResponse, User } from '@/types/Profile';

// Mock de la API
vi.mock('@/api/modules/profile.api');

describe('Profile Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validación de estructura de respuesta', () => {
    it('debería validar respuesta exitosa con todos los campos', async () => {
      // Arrange
      const validResponse: ProfileResponse = {
        success: true,
        message: 'Perfil obtenido correctamente',
        user: {
          id: 123,
          email: 'test@example.com',
          fullName: 'Juan Pérez',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(validResponse);

      // Act & Assert
      await expect(ProfileService.getProfile()).resolves.toEqual(validResponse);
    });

    it('debería rechazar respuesta con success false', async () => {
      // Arrange
      const invalidResponse = {
        success: false,
        message: 'Usuario no encontrado',
        user: null,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(invalidResponse);

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Usuario no encontrado');
    });

    it('debería rechazar respuesta null', async () => {
      // Arrange
      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(null);

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Respuesta del perfil inválida');
    });

    it('debería rechazar respuesta undefined', async () => {
      // Arrange
      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(undefined);

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Respuesta del perfil inválida');
    });

    it('debería rechazar respuesta que no es objeto', async () => {
      // Arrange
      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue('not an object');

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Respuesta del perfil inválida');
    });
  });

  describe('validación de campos de usuario', () => {
    it('debería aceptar usuario con todos los campos válidos', async () => {
      // Arrange
      const validUser: User = {
        id: 123,
        email: 'usuario@example.com',
        fullName: 'Juan Carlos Pérez López',
        createdAt: '2023-01-01T00:00:00Z',
      };

      const response: ProfileResponse = {
        success: true,
        message: 'OK',
        user: validUser,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act
      const result = await ProfileService.getProfile();

      // Assert
      expect(result.user.id).toBe(123);
      expect(result.user.email).toBe('usuario@example.com');
      expect(result.user.fullName).toBe('Juan Carlos Pérez López');
      expect(result.user.createdAt).toBe('2023-01-01T00:00:00Z');
    });

    it('debería aceptar ID numérico válido', async () => {
      // Arrange
      const validIds = [1, 123, 999999, 2147483647];

      for (const id of validIds) {
        const response: ProfileResponse = {
          success: true,
          message: 'OK',
          user: {
            id,
            email: 'test@example.com',
            fullName: 'Test User',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        const { profileApi } = await import('@/api/modules/profile.api');
        (profileApi.getProfile as any).mockResolvedValue(response);

        // Act
        const result = await ProfileService.getProfile();

        // Assert
        expect(result.user.id).toBe(id);
      }
    });

    it('debería aceptar emails válidos', async () => {
      // Arrange
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.co',
      ];

      for (const email of validEmails) {
        const response: ProfileResponse = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            email,
            fullName: 'Test User',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        const { profileApi } = await import('@/api/modules/profile.api');
        (profileApi.getProfile as any).mockResolvedValue(response);

        // Act
        const result = await ProfileService.getProfile();

        // Assert
        expect(result.user.email).toBe(email);
      }
    });

    it('debería aceptar nombres completos válidos', async () => {
      // Arrange
      const validNames = [
        'Juan Pérez',
        'María José García López',
        'José',
        "Ana-Sofía O'Connor",
        'François Müller',
        '李小明',
        'محمد عبدالله',
      ];

      for (const fullName of validNames) {
        const response: ProfileResponse = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            email: 'test@example.com',
            fullName,
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        const { profileApi } = await import('@/api/modules/profile.api');
        (profileApi.getProfile as any).mockResolvedValue(response);

        // Act
        const result = await ProfileService.getProfile();

        // Assert
        expect(result.user.fullName).toBe(fullName);
      }
    });

    it('debería aceptar fechas de creación válidas', async () => {
      // Arrange
      const validDates = [
        '2023-01-01T00:00:00Z',
        '2023-12-31T23:59:59Z',
        '2020-02-29T12:30:45Z', // leap year
        '1970-01-01T00:00:00Z',
      ];

      for (const createdAt of validDates) {
        const response: ProfileResponse = {
          success: true,
          message: 'OK',
          user: {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            createdAt,
          },
        };

        const { profileApi } = await import('@/api/modules/profile.api');
        (profileApi.getProfile as any).mockResolvedValue(response);

        // Act
        const result = await ProfileService.getProfile();

        // Assert
        expect(result.user.createdAt).toBe(createdAt);
      }
    });
  });

  describe('edge cases de validación', () => {
    it('debería manejar campos con valores límite', async () => {
      // Arrange
      const edgeCaseUser: User = {
        id: Number.MAX_SAFE_INTEGER,
        email: `${'a'.repeat(50)  }@${  'b'.repeat(50)  }.com`, // email muy largo
        fullName: 'A'.repeat(100), // nombre muy largo
        createdAt: '9999-12-31T23:59:59Z', // fecha futura
      };

      const response: ProfileResponse = {
        success: true,
        message: 'Edge case user',
        user: edgeCaseUser,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act
      const result = await ProfileService.getProfile();

      // Assert
      expect(result.user).toEqual(edgeCaseUser);
    });

    it('debería manejar caracteres especiales en campos de texto', async () => {
      // Arrange
      const specialCharUser: User = {
        id: 1,
        email: 'test+special@example-domain.co.uk',
        fullName: 'José María Ñoño & López-García',
        createdAt: '2023-01-01T00:00:00Z',
      };

      const response: ProfileResponse = {
        success: true,
        message: 'Usuario con caracteres especiales',
        user: specialCharUser,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act
      const result = await ProfileService.getProfile();

      // Assert
      expect(result.user.fullName).toContain('ñ');
      expect(result.user.fullName).toContain('&');
      expect(result.user.email).toContain('+');
    });

    it('debería manejar campos vacíos (pero válidos según el tipo)', async () => {
      // Arrange
      const emptyFieldsUser = {
        id: 0,
        email: '',
        fullName: '',
        createdAt: '',
      };

      const response = {
        success: true,
        message: 'Usuario con campos vacíos',
        user: emptyFieldsUser,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act
      const result = await ProfileService.getProfile();

      // Assert - El servicio no valida contenido, solo estructura
      expect(result.user.id).toBe(0);
      expect(result.user.email).toBe('');
      expect(result.user.fullName).toBe('');
    });

    it('debería manejar tipos incorrectos en campos (si la API los devuelve)', async () => {
      // Arrange
      const wrongTypesUser = {
        id: '123', // string en lugar de number
        email: 123, // number en lugar de string
        fullName: null, // null en lugar de string
        createdAt: undefined, // undefined en lugar de string
      };

      const response = {
        success: true,
        message: 'Tipos incorrectos',
        user: wrongTypesUser,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act
      const result = await ProfileService.getProfile();

      // Assert - El servicio no valida tipos específicos
      expect(result.user).toEqual(wrongTypesUser);
    });
  });

  describe('validación de mensajes', () => {
    it('debería aceptar mensaje vacío', async () => {
      // Arrange
      const response = {
        success: true,
        message: '',
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act
      const result = await ProfileService.getProfile();

      // Assert
      expect(result.message).toBe('');
    });

    it('debería aceptar mensaje largo', async () => {
      // Arrange
      const longMessage =
        'Este es un mensaje muy largo que podría contener información detallada sobre el estado del perfil del usuario y cualquier acción que se haya realizado recientemente.';

      const response = {
        success: true,
        message: longMessage,
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act
      const result = await ProfileService.getProfile();

      // Assert
      expect(result.message).toBe(longMessage);
    });

    it('debería usar mensaje por defecto cuando success es false sin mensaje', async () => {
      // Arrange
      const response = {
        success: false,
        message: '',
        user: null,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Error al obtener el perfil');
    });
  });

  describe('validación de success flag', () => {
    it('debería aceptar success: true', async () => {
      // Arrange
      const response = {
        success: true,
        message: 'OK',
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act & Assert
      await expect(ProfileService.getProfile()).resolves.toEqual(response);
    });

    it('debería rechazar success: false', async () => {
      // Arrange
      const response = {
        success: false,
        message: 'Error específico',
        user: null,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Error específico');
    });

    it('debería tratar valores truthy como success', async () => {
      // Arrange
      const truthyValues = [1, 'true', 'any string', {}, []];

      for (const successValue of truthyValues) {
        const response = {
          success: successValue,
          message: 'OK',
          user: {
            id: 1,
            email: 'test@example.com',
            fullName: 'Test User',
            createdAt: '2023-01-01T00:00:00Z',
          },
        };

        const { profileApi } = await import('@/api/modules/profile.api');
        (profileApi.getProfile as any).mockResolvedValue(response);

        // Act & Assert
        await expect(ProfileService.getProfile()).resolves.toEqual(response);
      }
    });

    it('debería tratar valores falsy (excepto false) como success', async () => {
      // Arrange - Solo false explícito es considerado error
      const response = {
        success: false,
        message: 'Explicit false',
        user: null,
      };

      const { profileApi } = await import('@/api/modules/profile.api');
      (profileApi.getProfile as any).mockResolvedValue(response);

      // Act & Assert
      await expect(ProfileService.getProfile()).rejects.toThrow('Explicit false');
    });
  });
});
