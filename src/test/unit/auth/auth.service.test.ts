import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { authApi } from '@/api/modules/auth.api';
import type { AuthCredentials, RegisterPayload, AuthResponse } from '@/types/Auth';

// Mock del módulo auth.api
vi.mock('@/api/modules/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  }
}));

describe('AuthService', () => {
  const mockAuthApi = authApi as any;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    const validCredentials: AuthCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockAuthResponse: AuthResponse = {
      success: true,
      message: 'Login exitoso',
      userId: 123,
      bearer: 'mock-token-123'
    };

    describe('casos de éxito', () => {
      it('debería hacer login exitosamente con credenciales válidas', async () => {
        // Arrange
        mockAuthApi.login.mockResolvedValueOnce(mockAuthResponse);

        // Act
        const result = await AuthService.login(validCredentials);

        // Assert
        expect(mockAuthApi.login).toHaveBeenCalledWith(validCredentials);
        expect(result).toEqual(mockAuthResponse);
      });

      it('debería hacer login con email con espacios que se recortan automáticamente', async () => {
        // Arrange
        const credentialsWithSpaces = {
          email: '  test@example.com  ',
          password: 'password123'
        };
        mockAuthApi.login.mockResolvedValueOnce(mockAuthResponse);

        // Act
        const result = await AuthService.login(credentialsWithSpaces);

        // Assert
        expect(result).toEqual(mockAuthResponse);
        expect(mockAuthApi.login).toHaveBeenCalledWith(credentialsWithSpaces);
      });

      it('debería hacer login con password exactamente de 8 caracteres', async () => {
        // Arrange
        const minPasswordCredentials = {
          email: 'test@example.com',
          password: '12345678' // exactamente 8 caracteres
        };
        mockAuthApi.login.mockResolvedValueOnce(mockAuthResponse);

        // Act
        const result = await AuthService.login(minPasswordCredentials);

        // Assert
        expect(result).toEqual(mockAuthResponse);
      });
    });

    describe('casos de error de validación', () => {
      it('debería lanzar error si email está vacío', async () => {
        // Arrange
        const invalidCredentials = { email: '', password: 'password123' };

        // Act & Assert
        await expect(AuthService.login(invalidCredentials)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería lanzar error si email es solo espacios', async () => {
        // Arrange
        const invalidCredentials = { email: '   ', password: 'password123' };

        // Act & Assert
        await expect(AuthService.login(invalidCredentials)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería lanzar error si password está vacío', async () => {
        // Arrange
        const invalidCredentials = { email: 'test@example.com', password: '' };

        // Act & Assert
        await expect(AuthService.login(invalidCredentials)).rejects.toThrow('Password es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería lanzar error si password es solo espacios', async () => {
        // Arrange
        const invalidCredentials = { email: 'test@example.com', password: '   ' };

        // Act & Assert
        await expect(AuthService.login(invalidCredentials)).rejects.toThrow('Password es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería lanzar error si email tiene formato inválido', async () => {
        // Arrange
        const invalidEmails = [
          'invalid-email',     // sin @
          'test@',             // sin dominio
          '@example.com',      // sin parte local
          'test@example',      // sin punto en dominio
          'test @example.com', // espacio en parte local
          'test@ex ample.com', // espacio en dominio
          'test@@example.com', // doble @
        ];

        // Act & Assert
        for (const email of invalidEmails) {
          const credentials = { email, password: 'password123' };
          await expect(AuthService.login(credentials)).rejects.toThrow('Email no tiene un formato válido');
          expect(mockAuthApi.login).not.toHaveBeenCalled();
        }
      });

      it('debería lanzar error si password tiene menos de 8 caracteres', async () => {
        // Arrange
        const shortPasswords = ['1', '12', '123', '1234', '12345', '123456', '1234567'];

        // Act & Assert
        for (const password of shortPasswords) {
          const credentials = { email: 'test@example.com', password };
          await expect(AuthService.login(credentials)).rejects.toThrow('Password debe tener al menos 8 caracteres');
        }
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      it('debería lanzar error si credentials es null', async () => {
        // Act & Assert
        await expect(AuthService.login(null as any)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería lanzar error si credentials es undefined', async () => {
        // Act & Assert
        await expect(AuthService.login(undefined as any)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería lanzar error si email es null', async () => {
        // Arrange
        const invalidCredentials = { email: null as any, password: 'password123' };

        // Act & Assert
        await expect(AuthService.login(invalidCredentials)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería lanzar error si password es null', async () => {
        // Arrange
        const invalidCredentials = { email: 'test@example.com', password: null as any };

        // Act & Assert
        await expect(AuthService.login(invalidCredentials)).rejects.toThrow('Password es requerido');
        expect(mockAuthApi.login).not.toHaveBeenCalled();
      });

      it('debería manejar objetos con propiedades adicionales', async () => {
        // Arrange
        const extendedCredentials = {
          ...validCredentials,
          extraField: 'should be ignored',
          anotherField: 123
        };
        mockAuthApi.login.mockResolvedValueOnce(mockAuthResponse);

        // Act
        const result = await AuthService.login(extendedCredentials);

        // Assert
        expect(result).toEqual(mockAuthResponse);
        expect(mockAuthApi.login).toHaveBeenCalledWith(extendedCredentials);
      });
    });

    describe('casos de error de API', () => {
      it('debería re-lanzar errores conocidos de la API', async () => {
        // Arrange
        const apiError = new Error('Credenciales inválidas');
        mockAuthApi.login.mockRejectedValueOnce(apiError);

        // Act & Assert
        await expect(AuthService.login(validCredentials)).rejects.toThrow('Credenciales inválidas');
      });

      it('debería manejar errores desconocidos de la API', async () => {
        // Arrange
        mockAuthApi.login.mockRejectedValueOnce('Unknown error');

        // Act & Assert
        await expect(AuthService.login(validCredentials)).rejects.toThrow('Error desconocido durante el login');
      });

      it('debería manejar cuando la API lanza null', async () => {
        // Arrange
        mockAuthApi.login.mockRejectedValueOnce(null);

        // Act & Assert
        await expect(AuthService.login(validCredentials)).rejects.toThrow('Error desconocido durante el login');
      });

      it('debería manejar cuando la API lanza undefined', async () => {
        // Arrange
        mockAuthApi.login.mockRejectedValueOnce(undefined);

        // Act & Assert
        await expect(AuthService.login(validCredentials)).rejects.toThrow('Error desconocido durante el login');
      });
    });
  });

  describe('register', () => {
    const validRegisterPayload: RegisterPayload = {
      email: 'newuser@example.com',
      password: 'password123',
      fullName: 'Juan Pérez'
    };

    const mockRegisterResponse: AuthResponse = {
      success: true,
      message: 'Registro exitoso',
      userId: 456,
      bearer: 'mock-token-456'
    };

    describe('casos de éxito', () => {
      it('debería registrar usuario exitosamente con datos válidos', async () => {
        // Arrange
        mockAuthApi.register.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        const result = await AuthService.register(validRegisterPayload);

        // Assert
        expect(mockAuthApi.register).toHaveBeenCalledWith(validRegisterPayload);
        expect(result).toEqual(mockRegisterResponse);
      });

      it('debería registrar con fullName que tiene acentos y espacios', async () => {
        // Arrange
        const validPayload = {
          ...validRegisterPayload,
          fullName: 'María José Rodríguez-García'
        };
        mockAuthApi.register.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        const result = await AuthService.register(validPayload);

        // Assert
        expect(result).toEqual(mockRegisterResponse);
      });

      it('debería registrar con fullName que tiene ñ', async () => {
        // Arrange
        const validPayload = {
          ...validRegisterPayload,
          fullName: 'Niño Muñoz'
        };
        mockAuthApi.register.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        const result = await AuthService.register(validPayload);

        // Assert
        expect(result).toEqual(mockRegisterResponse);
      });

      it('debería registrar con fullName exactamente de 2 caracteres', async () => {
        // Arrange
        const validPayload = {
          ...validRegisterPayload,
          fullName: 'Jo' // exactamente 2 caracteres
        };
        mockAuthApi.register.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        const result = await AuthService.register(validPayload);

        // Assert
        expect(result).toEqual(mockRegisterResponse);
      });
    });

    describe('casos de error de validación - hereda de login', () => {
      it('debería lanzar error si email está vacío', async () => {
        // Arrange
        const invalidPayload = { ...validRegisterPayload, email: '' };

        // Act & Assert
        await expect(AuthService.register(invalidPayload)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería lanzar error si password es muy corto', async () => {
        // Arrange
        const invalidPayload = { ...validRegisterPayload, password: '1234567' };

        // Act & Assert
        await expect(AuthService.register(invalidPayload)).rejects.toThrow('Password debe tener al menos 8 caracteres');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería lanzar error si email tiene formato inválido', async () => {
        // Arrange
        const invalidPayload = { ...validRegisterPayload, email: 'invalid-email' };

        // Act & Assert
        await expect(AuthService.register(invalidPayload)).rejects.toThrow('Email no tiene un formato válido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });
    });

    describe('casos de error específicos de registro', () => {
      it('debería lanzar error si fullName está vacío', async () => {
        // Arrange
        const invalidPayload = { ...validRegisterPayload, fullName: '' };

        // Act & Assert
        await expect(AuthService.register(invalidPayload)).rejects.toThrow('Nombre completo es requerido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería lanzar error si fullName es solo espacios', async () => {
        // Arrange
        const invalidPayload = { ...validRegisterPayload, fullName: '   ' };

        // Act & Assert
        await expect(AuthService.register(invalidPayload)).rejects.toThrow('Nombre completo es requerido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería lanzar error si fullName tiene menos de 2 caracteres', async () => {
        // Arrange
        const shortNames = ['', 'A'];

        // Act & Assert
        for (const fullName of shortNames) {
          const payload = { ...validRegisterPayload, fullName };
          await expect(AuthService.register(payload)).rejects.toThrow(/Nombre completo/);
          expect(mockAuthApi.register).not.toHaveBeenCalled();
        }
      });

      it('debería lanzar error si fullName contiene caracteres no válidos', async () => {
        // Arrange
        const invalidNames = [
          'Juan123',
          'María@test',
          'Pedro#García',
          'Ana$López',
          'Luis%Martín',
          'Test<script>',
          'User&Admin',
          'Test123',
          'Name*Invalid'
        ];

        // Act & Assert
        for (const fullName of invalidNames) {
          const payload = { ...validRegisterPayload, fullName };
          await expect(AuthService.register(payload)).rejects.toThrow('Nombre completo contiene caracteres no válidos');
        }
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });
    });

    describe('edge cases específicos de registro', () => {
      it('debería lanzar error si payload es null', async () => {
        // Act & Assert
        await expect(AuthService.register(null as any)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería lanzar error si payload es undefined', async () => {
        // Act & Assert
        await expect(AuthService.register(undefined as any)).rejects.toThrow('Email es requerido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería lanzar error si fullName es null', async () => {
        // Arrange
        const invalidPayload = { ...validRegisterPayload, fullName: null as any };

        // Act & Assert
        await expect(AuthService.register(invalidPayload)).rejects.toThrow('Nombre completo es requerido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería lanzar error si fullName es undefined', async () => {
        // Arrange
        const invalidPayload = { ...validRegisterPayload, fullName: undefined as any };

        // Act & Assert
        await expect(AuthService.register(invalidPayload)).rejects.toThrow('Nombre completo es requerido');
        expect(mockAuthApi.register).not.toHaveBeenCalled();
      });

      it('debería manejar objetos con propiedades adicionales', async () => {
        // Arrange
        const extendedPayload = {
          ...validRegisterPayload,
          extraField: 'should be ignored',
          terms: true
        };
        mockAuthApi.register.mockResolvedValueOnce(mockRegisterResponse);

        // Act
        const result = await AuthService.register(extendedPayload);

        // Assert
        expect(result).toEqual(mockRegisterResponse);
        expect(mockAuthApi.register).toHaveBeenCalledWith(extendedPayload);
      });
    });

    describe('casos de error de API', () => {
      it('debería re-lanzar errores conocidos de la API', async () => {
        // Arrange
        const apiError = new Error('Email ya está registrado');
        mockAuthApi.register.mockRejectedValueOnce(apiError);

        // Act & Assert
        await expect(AuthService.register(validRegisterPayload)).rejects.toThrow('Email ya está registrado');
      });

      it('debería manejar errores desconocidos de la API', async () => {
        // Arrange
        mockAuthApi.register.mockRejectedValueOnce('Unknown error');

        // Act & Assert
        await expect(AuthService.register(validRegisterPayload)).rejects.toThrow('Error desconocido durante el registro');
      });

      it('debería manejar cuando la API lanza null', async () => {
        // Arrange
        mockAuthApi.register.mockRejectedValueOnce(null);

        // Act & Assert
        await expect(AuthService.register(validRegisterPayload)).rejects.toThrow('Error desconocido durante el registro');
      });

      it('debería manejar cuando la API lanza undefined', async () => {
        // Arrange
        mockAuthApi.register.mockRejectedValueOnce(undefined);

        // Act & Assert
        await expect(AuthService.register(validRegisterPayload)).rejects.toThrow('Error desconocido durante el registro');
      });
    });
  });
});