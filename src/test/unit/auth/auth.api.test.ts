import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authApi } from '@/api/modules/auth.api';
import http from '@/api/httpClient';
import type { AuthCredentials, RegisterPayload } from '@/types/Auth';

// Mock del httpClient
vi.mock('@/api/httpClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('authApi', () => {
  const mockHttp = http as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    const validCredentials: AuthCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockApiResponse = {
      data: {
        success: true,
        message: 'Login exitoso',
        userId: 123,
        bearer: 'mock-token-123',
      },
    };

    describe('casos de éxito', () => {
      it('debería hacer login exitosamente y devolver los datos', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce(mockApiResponse);

        // Act
        const result = await authApi.login(validCredentials);

        // Assert
        expect(mockHttp.post).toHaveBeenCalledWith('/login', validCredentials);
        expect(result).toEqual(mockApiResponse.data);
      });

      it('debería llamar la API con las credenciales exactas proporcionadas', async () => {
        // Arrange
        const credentialsWithExtraSpaces = {
          email: '  test@example.com  ',
          password: 'password123',
        };
        mockHttp.post.mockResolvedValueOnce(mockApiResponse);

        // Act
        await authApi.login(credentialsWithExtraSpaces);

        // Assert
        expect(mockHttp.post).toHaveBeenCalledWith('/login', credentialsWithExtraSpaces);
      });
    });

    describe('casos de error', () => {
      it('debería propagar errores de red', async () => {
        // Arrange
        const networkError = new Error('Network error');
        mockHttp.post.mockRejectedValueOnce(networkError);

        // Act & Assert
        await expect(authApi.login(validCredentials)).rejects.toThrow('Network error');
        expect(mockHttp.post).toHaveBeenCalledWith('/login', validCredentials);
      });

      it('debería propagar errores 401 de autenticación', async () => {
        // Arrange
        const authError = new Error('Unauthorized');
        authError.name = 'AxiosError';
        (authError as any).response = { status: 401 };
        mockHttp.post.mockRejectedValueOnce(authError);

        // Act & Assert
        await expect(authApi.login(validCredentials)).rejects.toThrow('Unauthorized');
      });

      it('debería propagar errores 500 del servidor', async () => {
        // Arrange
        const serverError = new Error('Internal Server Error');
        (serverError as any).response = { status: 500 };
        mockHttp.post.mockRejectedValueOnce(serverError);

        // Act & Assert
        await expect(authApi.login(validCredentials)).rejects.toThrow('Internal Server Error');
      });
    });

    describe('edge cases', () => {
      it('debería manejar respuesta con data undefined', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce({ data: undefined });

        // Act
        const result = await authApi.login(validCredentials);

        // Assert
        expect(result).toBeUndefined();
      });

      it('debería manejar respuesta con data null', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce({ data: null });

        // Act
        const result = await authApi.login(validCredentials);

        // Assert
        expect(result).toBeNull();
      });

      it('debería manejar respuesta vacía', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce({});

        // Act
        const result = await authApi.login(validCredentials);

        // Assert
        expect(result).toBeUndefined();
      });
    });
  });

  describe('register', () => {
    const validRegisterPayload: RegisterPayload = {
      email: 'newuser@example.com',
      password: 'password123',
      fullName: 'Juan Pérez',
    };

    const mockRegisterResponse = {
      data: {
        success: true,
        message: 'Registro exitoso',
        userId: 456,
        bearer: 'mock-token-456',
      },
    };

    describe('casos de éxito', () => {
      it('debería registrar usuario exitosamente y devolver los datos', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        const result = await authApi.register(validRegisterPayload);

        // Assert
        expect(mockHttp.post).toHaveBeenCalledWith('/register', validRegisterPayload);
        expect(result).toEqual(mockRegisterResponse.data);
      });

      it('debería llamar la API con el payload exacto proporcionado', async () => {
        // Arrange
        const payloadWithExtraFields = {
          ...validRegisterPayload,
          extraField: 'should be sent to API',
        };
        mockHttp.post.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        await authApi.register(payloadWithExtraFields as any);

        // Assert
        expect(mockHttp.post).toHaveBeenCalledWith('/register', payloadWithExtraFields);
      });
    });

    describe('casos de error', () => {
      it('debería propagar errores de red', async () => {
        // Arrange
        const networkError = new Error('Network error');
        mockHttp.post.mockRejectedValueOnce(networkError);

        // Act & Assert
        await expect(authApi.register(validRegisterPayload)).rejects.toThrow('Network error');
        expect(mockHttp.post).toHaveBeenCalledWith('/register', validRegisterPayload);
      });

      it('debería propagar errores 409 de conflicto (email duplicado)', async () => {
        // Arrange
        const conflictError = new Error('Email already exists');
        (conflictError as any).response = { status: 409 };
        mockHttp.post.mockRejectedValueOnce(conflictError);

        // Act & Assert
        await expect(authApi.register(validRegisterPayload)).rejects.toThrow(
          'Email already exists'
        );
      });

      it('debería propagar errores 400 de validación', async () => {
        // Arrange
        const validationError = new Error('Invalid payload');
        (validationError as any).response = { status: 400 };
        mockHttp.post.mockRejectedValueOnce(validationError);

        // Act & Assert
        await expect(authApi.register(validRegisterPayload)).rejects.toThrow('Invalid payload');
      });

      it('debería propagar errores de timeout', async () => {
        // Arrange
        const timeoutError = new Error('Request timeout');
        (timeoutError as any).code = 'ECONNABORTED';
        mockHttp.post.mockRejectedValueOnce(timeoutError);

        // Act & Assert
        await expect(authApi.register(validRegisterPayload)).rejects.toThrow('Request timeout');
      });
    });

    describe('edge cases', () => {
      it('debería manejar respuesta con data undefined', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce({ data: undefined });

        // Act
        const result = await authApi.register(validRegisterPayload);

        // Assert
        expect(result).toBeUndefined();
      });

      it('debería manejar respuesta con data null', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce({ data: null });

        // Act
        const result = await authApi.register(validRegisterPayload);

        // Assert
        expect(result).toBeNull();
      });

      it('debería manejar respuesta vacía', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce({});

        // Act
        const result = await authApi.register(validRegisterPayload);

        // Assert
        expect(result).toBeUndefined();
      });

      it('debería manejar payload vacío', async () => {
        // Arrange
        mockHttp.post.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        await authApi.register({} as RegisterPayload);

        // Assert
        expect(mockHttp.post).toHaveBeenCalledWith('/register', {});
      });
    });
  });

  describe('integración HTTP client', () => {
    it('debería usar POST method para ambos endpoints', async () => {
      // Arrange
      const credentials = { email: 'test@test.com', password: 'password123' };
      const payload = { ...credentials, fullName: 'Test User' };

      mockHttp.post.mockResolvedValue({ data: {} });

      // Act
      await authApi.login(credentials);
      await authApi.register(payload);

      // Assert
      expect(mockHttp.post).toHaveBeenNthCalledWith(1, '/login', credentials);
      expect(mockHttp.post).toHaveBeenNthCalledWith(2, '/register', payload);
      expect(mockHttp.post).toHaveBeenCalledTimes(2);
    });

    it('debería usar los endpoints correctos', async () => {
      // Arrange
      const credentials = { email: 'test@test.com', password: 'password123' };
      const payload = { ...credentials, fullName: 'Test User' };

      mockHttp.post.mockResolvedValue({ data: {} });

      // Act
      await authApi.login(credentials);
      await authApi.register(payload);

      // Assert
      expect(mockHttp.post).toHaveBeenCalledWith('/login', expect.any(Object));
      expect(mockHttp.post).toHaveBeenCalledWith('/register', expect.any(Object));
    });
  });
});
