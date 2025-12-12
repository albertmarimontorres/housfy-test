import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { authApi } from '@/api/modules/auth.api';
import http from '@/api/httpClient';
import type { AuthCredentials, RegisterPayload, AuthResponse } from '@/types/Auth';

// Mock completo del stack
vi.mock('@/api/httpClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('@/api/modules/auth.api');

describe('Auth Integration Tests', () => {
  const mockHttp = http as any;
  const mockAuthApi = authApi as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Restaurar implementación real de authApi
    mockAuthApi.login.mockImplementation(async (credentials: AuthCredentials) => {
      const { data } = await http.post<AuthResponse>('/login', credentials);
      return data;
    });

    mockAuthApi.register.mockImplementation(async (payload: RegisterPayload) => {
      const { data } = await http.post<AuthResponse>('/register', payload);
      return data;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flujo completo de login', () => {
    it('debería completar flujo exitoso desde validación hasta API', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse: AuthResponse = {
        success: true,
        message: 'Login exitoso',
        userId: 123,
        bearer: 'auth-token-123',
      };

      mockHttp.post.mockResolvedValueOnce({ data: expectedResponse });

      // Act
      const result = await AuthService.login(credentials);

      // Assert
      expect(mockHttp.post).toHaveBeenCalledWith('/login', credentials);
      expect(result).toEqual(expectedResponse);
    });

    it('debería fallar en validación antes de llegar a API', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'invalid-email',
        password: '123',
      };

      // Act & Assert
      await expect(AuthService.login(invalidCredentials)).rejects.toThrow();

      // La API no debería haber sido llamada
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('debería manejar errores de API después de validación exitosa', async () => {
      // Arrange
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const apiError = new Error('Credenciales inválidas');
      mockHttp.post.mockRejectedValueOnce(apiError);

      // Act & Assert
      await expect(AuthService.login(validCredentials)).rejects.toThrow('Credenciales inválidas');

      // Verificar que llegó a la API
      expect(mockHttp.post).toHaveBeenCalledWith('/login', validCredentials);
    });

    it('debería manejar respuestas de API malformadas', async () => {
      // Arrange
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Respuesta sin data
      mockHttp.post.mockResolvedValueOnce({});

      // Act
      const result = await AuthService.login(validCredentials);

      // Assert
      expect(result).toBeUndefined();
      expect(mockHttp.post).toHaveBeenCalledWith('/login', validCredentials);
    });
  });

  describe('flujo completo de registro', () => {
    it('debería completar flujo exitoso desde validación hasta API', async () => {
      // Arrange
      const payload = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'Juan Pérez',
      };

      const expectedResponse: AuthResponse = {
        success: true,
        message: 'Registro exitoso',
        userId: 456,
        bearer: 'auth-token-456',
      };

      mockHttp.post.mockResolvedValueOnce({ data: expectedResponse });

      // Act
      const result = await AuthService.register(payload);

      // Assert
      expect(mockHttp.post).toHaveBeenCalledWith('/register', payload);
      expect(result).toEqual(expectedResponse);
    });

    it('debería fallar en validación de email antes de llegar a API', async () => {
      // Arrange
      const invalidPayload = {
        email: 'invalid-email',
        password: 'password123',
        fullName: 'Juan Pérez',
      };

      // Act & Assert
      await expect(AuthService.register(invalidPayload)).rejects.toThrow(
        'Email no tiene un formato válido'
      );

      // La API no debería haber sido llamada
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('debería fallar en validación de password antes de llegar a API', async () => {
      // Arrange
      const invalidPayload = {
        email: 'test@example.com',
        password: '123',
        fullName: 'Juan Pérez',
      };

      // Act & Assert
      await expect(AuthService.register(invalidPayload)).rejects.toThrow(
        'Password debe tener al menos 8 caracteres'
      );

      // La API no debería haber sido llamada
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('debería fallar en validación de fullName antes de llegar a API', async () => {
      // Arrange
      const invalidPayload = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'A',
      };

      // Act & Assert
      await expect(AuthService.register(invalidPayload)).rejects.toThrow(
        'Nombre completo debe tener al menos 2 caracteres'
      );

      // La API no debería haber sido llamada
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('debería manejar errores de API después de validación exitosa', async () => {
      // Arrange
      const validPayload = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Juan Pérez',
      };

      const apiError = new Error('Email ya está registrado');
      mockHttp.post.mockRejectedValueOnce(apiError);

      // Act & Assert
      await expect(AuthService.register(validPayload)).rejects.toThrow('Email ya está registrado');

      // Verificar que llegó a la API
      expect(mockHttp.post).toHaveBeenCalledWith('/register', validPayload);
    });
  });

  describe('casos de error de red e infraestructura', () => {
    it('debería manejar errores de conexión en login', async () => {
      // Arrange
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      mockHttp.post.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(AuthService.login(validCredentials)).rejects.toThrow('Network Error');
    });

    it('debería manejar timeouts en registro', async () => {
      // Arrange
      const validPayload = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Juan Pérez',
      };

      const timeoutError = new Error('Request timeout');
      (timeoutError as any).code = 'ECONNABORTED';
      mockHttp.post.mockRejectedValueOnce(timeoutError);

      // Act & Assert
      await expect(AuthService.register(validPayload)).rejects.toThrow('Request timeout');
    });

    it('debería manejar errores de servidor 5xx', async () => {
      // Arrange
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const serverError = new Error('Internal Server Error');
      (serverError as any).response = { status: 500 };
      mockHttp.post.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(AuthService.login(validCredentials)).rejects.toThrow('Internal Server Error');
    });

    it('debería manejar errores de cliente 4xx', async () => {
      // Arrange
      const validPayload = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Juan Pérez',
      };

      const clientError = new Error('Bad Request');
      (clientError as any).response = { status: 400 };
      mockHttp.post.mockRejectedValueOnce(clientError);

      // Act & Assert
      await expect(AuthService.register(validPayload)).rejects.toThrow('Bad Request');
    });
  });

  describe('escenarios de datos extremos', () => {
    it('debería manejar datos muy largos que pasan validación', async () => {
      // Arrange
      const extremePayload = {
        email: 'test@example.com',
        password: `password123${  'x'.repeat(1000)}`, // password muy largo
        fullName: `Juan ${  'Pérez '.repeat(100)}`, // nombre muy largo
      };

      const response: AuthResponse = {
        success: true,
        message: 'Registro exitoso',
        userId: 789,
        bearer: 'token-789',
      };

      mockHttp.post.mockResolvedValueOnce({ data: response });

      // Act
      const result = await AuthService.register(extremePayload);

      // Assert
      expect(result).toEqual(response);
      expect(mockHttp.post).toHaveBeenCalledWith('/register', extremePayload);
    });

    it('debería manejar caracteres especiales válidos en nombres', async () => {
      // Arrange
      const specialNamePayload = {
        email: 'test@example.com',
        password: 'password123',
        fullName: "María José O'Connor-García",
      };

      const response: AuthResponse = {
        success: true,
        message: 'Registro exitoso',
        userId: 999,
        bearer: 'token-999',
      };

      mockHttp.post.mockResolvedValueOnce({ data: response });

      // Act
      const result = await AuthService.register(specialNamePayload);

      // Assert
      expect(result).toEqual(response);
      expect(mockHttp.post).toHaveBeenCalledWith('/register', specialNamePayload);
    });

    it('debería manejar respuestas de API con campos adicionales', async () => {
      // Arrange
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const extendedResponse = {
        data: {
          success: true,
          message: 'Login exitoso',
          userId: 123,
          bearer: 'token-123',
          // Campos adicionales que no están en el tipo
          extra: 'data',
          timestamp: '2023-01-01T00:00:00Z',
          permissions: ['read', 'write'],
        },
      };

      mockHttp.post.mockResolvedValueOnce(extendedResponse);

      // Act
      const result = await AuthService.login(validCredentials);

      // Assert
      expect(result).toEqual(extendedResponse.data);
    });
  });

  describe('validación de tipos y contratos', () => {
    it('debería mantener la estructura exacta de AuthResponse', async () => {
      // Arrange
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response: AuthResponse = {
        success: true,
        message: 'Login exitoso',
        userId: 123,
        bearer: 'auth-token',
      };

      mockHttp.post.mockResolvedValueOnce({ data: response });

      // Act
      const result = await AuthService.login(validCredentials);

      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message', 'Login exitoso');
      expect(result).toHaveProperty('userId', 123);
      expect(result).toHaveProperty('bearer', 'auth-token');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
      expect(typeof result.userId).toBe('number');
      expect(typeof result.bearer).toBe('string');
    });

    it('debería pasar credenciales sin modificación a la API', async () => {
      // Arrange
      const originalCredentials = {
        email: '  test@example.com  ', // con espacios
        password: 'password123',
      };

      mockHttp.post.mockResolvedValueOnce({ data: {} });

      // Act
      await AuthService.login(originalCredentials);

      // Assert
      // Verificar que se pasa exactamente lo que se recibió
      expect(mockHttp.post).toHaveBeenCalledWith('/login', originalCredentials);
    });

    it('debería pasar payload de registro sin modificación a la API', async () => {
      // Arrange
      const originalPayload = {
        email: '  test@example.com  ', // con espacios
        password: 'password123',
        fullName: '  Juan Pérez  ', // con espacios
      };

      mockHttp.post.mockResolvedValueOnce({ data: {} });

      // Act
      await AuthService.register(originalPayload);

      // Assert
      // Verificar que se pasa exactamente lo que se recibió
      expect(mockHttp.post).toHaveBeenCalledWith('/register', originalPayload);
    });
  });
});
