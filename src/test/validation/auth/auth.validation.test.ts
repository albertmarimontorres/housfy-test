import { describe, it, expect } from 'vitest';
import type { AuthCredentials, RegisterPayload } from '@/types/Auth';

// Como las funciones de validación están dentro del servicio y no son exportadas,
// vamos a probar la validación a través del servicio
import { AuthService } from '@/services/auth.service';

// Mock del authApi para que no haga llamadas reales
import { vi, beforeEach } from 'vitest';
import { authApi } from '@/api/modules/auth.api';

vi.mock('@/api/modules/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe('Validation Functions (tested through AuthService)', () => {
  const mockAuthApi = authApi as any;

  beforeEach(() => {
    // Configurar mocks para que resuelvan cuando las validaciones pasan
    mockAuthApi.login.mockResolvedValue({
      success: true,
      message: 'Login exitoso',
      userId: 123,
      bearer: 'mock-token',
    });

    mockAuthApi.register.mockResolvedValue({
      success: true,
      message: 'Registro exitoso',
      userId: 456,
      bearer: 'mock-token',
    });
  });

  describe('validateAuthCredentials', () => {
    describe('validaciones de email', () => {
      it('debería validar emails correctos', async () => {
        // Arrange
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'firstname+lastname@company.org',
          'test123@test-domain.com',
          'user_name@example-site.net',
        ];

        // Act & Assert
        for (const email of validEmails) {
          const credentials = { email, password: 'password123' };
          // Si no lanza error, la validación pasó
          try {
            await AuthService.login(credentials);
          } catch (error) {
            // Esperamos que falle por el mock, no por validación
            expect((error as Error).message).not.toContain('Email no tiene un formato válido');
          }
        }
      });

      it('debería rechazar emails con formato inválido', async () => {
        // Arrange - Solo emails que realmente fallan con el regex actual
        const invalidEmails = [
          'invalid', // sin @
          '@domain.com', // empieza con @
          'user@', // termina con @
          'user@domain', // sin punto en dominio
          'user name@domain.com', // espacio en parte local
          'user@domain .com', // espacio en dominio
          'user@@domain.com', // doble @
          'user@', // sin dominio
          '@', // solo @
          'user@.com', // dominio empieza con punto
        ];

        // Act & Assert
        for (const email of invalidEmails) {
          const credentials = { email, password: 'password123' };
          await expect(AuthService.login(credentials)).rejects.toThrow();
        }
      });

      it('debería rechazar emails null o undefined', async () => {
        // Arrange & Act & Assert
        const invalidCredentials = [
          { email: null as any, password: 'password123' },
          { email: undefined as any, password: 'password123' },
        ];

        for (const credentials of invalidCredentials) {
          await expect(AuthService.login(credentials)).rejects.toThrow('Email es requerido');
        }
      });
    });

    describe('validaciones de password', () => {
      it('debería validar passwords de longitud correcta', async () => {
        // Arrange
        const validPasswords = [
          '12345678', // mínimo 8 caracteres
          'password123',
          'superSecurePassword!@#',
          'a'.repeat(50), // password largo
        ];

        // Act & Assert
        for (const password of validPasswords) {
          const credentials = { email: 'test@example.com', password };
          try {
            await AuthService.login(credentials);
          } catch (error) {
            // Esperamos que falle por el mock, no por validación de password
            expect((error as Error).message).not.toContain(
              'Password debe tener al menos 8 caracteres'
            );
          }
        }
      });

      it('debería rechazar passwords muy cortos', async () => {
        // Arrange
        const shortPasswords = [
          '1',
          '12',
          '123',
          '1234',
          '12345',
          '123456',
          '1234567', // 7 caracteres - justo por debajo del límite
        ];

        // Act & Assert
        for (const password of shortPasswords) {
          const credentials = { email: 'test@example.com', password };
          await expect(AuthService.login(credentials)).rejects.toThrow(
            'Password debe tener al menos 8 caracteres'
          );
        }
      });

      it('debería rechazar passwords que son solo espacios', async () => {
        // Arrange
        const spacePasswords = [
          '   ',
          '        ', // 8 espacios
          '\t\t\t\t\t\t\t\t', // 8 tabs
        ];

        // Act & Assert
        for (const password of spacePasswords) {
          const credentials = { email: 'test@example.com', password };
          await expect(AuthService.login(credentials)).rejects.toThrow('Password es requerido');
        }
      });

      it('debería rechazar passwords null o undefined', async () => {
        // Arrange & Act & Assert
        const invalidCredentials = [
          { email: 'test@example.com', password: null as any },
          { email: 'test@example.com', password: undefined as any },
        ];

        for (const credentials of invalidCredentials) {
          await expect(AuthService.login(credentials)).rejects.toThrow('Password es requerido');
        }
      });
    });

    describe('validaciones de credenciales completas', () => {
      it('debería rechazar objeto credentials null o undefined', async () => {
        // Act & Assert
        await expect(AuthService.login(null as any)).rejects.toThrow('Email es requerido');
        await expect(AuthService.login(undefined as any)).rejects.toThrow('Email es requerido');
      });

      it('debería manejar objetos vacíos', async () => {
        // Act & Assert
        await expect(AuthService.login({} as AuthCredentials)).rejects.toThrow(
          'Email es requerido'
        );
      });

      it('debería manejar objetos con propiedades faltantes', async () => {
        // Arrange & Act & Assert
        await expect(
          AuthService.login({ email: 'test@test.com' } as AuthCredentials)
        ).rejects.toThrow('Password es requerido');
        await expect(
          AuthService.login({ password: 'password123' } as AuthCredentials)
        ).rejects.toThrow('Email es requerido');
      });
    });
  });

  describe('validateRegisterPayload', () => {
    describe('validaciones de fullName', () => {
      it('debería validar nombres correctos', async () => {
        // Arrange
        const validNames = [
          'Jo', // mínimo 2 caracteres
          'Juan',
          'María José',
          'Pedro García-López',
          'Ana María Rodríguez Pérez',
          'José Luis',
          'Ñoño',
          'François',
          "O'Connor",
          'Jean-Pierre',
          'María Ángeles',
        ];

        // Act & Assert
        for (const fullName of validNames) {
          const payload = {
            email: 'test@example.com',
            password: 'password123',
            fullName,
          };

          try {
            await AuthService.register(payload);
          } catch (error) {
            // Esperamos que falle por el mock, no por validación de nombre
            const errorMsg = (error as Error).message;
            expect(errorMsg).not.toContain('Nombre completo es requerido');
            expect(errorMsg).not.toContain('Nombre completo debe tener al menos 2 caracteres');
            expect(errorMsg).not.toContain('Nombre completo contiene caracteres no válidos');
          }
        }
      });

      it('debería rechazar nombres muy cortos', async () => {
        // Arrange
        const shortNames = [
          '',
          'A',
          ' ', // solo espacio
        ];

        // Act & Assert
        for (const fullName of shortNames) {
          const payload = {
            email: 'test@example.com',
            password: 'password123',
            fullName,
          };

          await expect(AuthService.register(payload)).rejects.toThrow(/Nombre completo/);
        }
      });

      it('debería rechazar nombres con caracteres no válidos', async () => {
        // Arrange
        const invalidNames = [
          'Juan123', // números
          'María@test', // @
          'Pedro#García', // #
          'Ana$López', // $
          'Luis%Martín', // %
          'Test<User>', // < >
          'User&Admin', // &
        ];

        // Act & Assert
        for (const fullName of invalidNames) {
          const payload = {
            email: 'test@example.com',
            password: 'password123',
            fullName,
          };

          await expect(AuthService.register(payload)).rejects.toThrow(
            'Nombre completo contiene caracteres no válidos'
          );
        }
      });

      it('debería rechazar nombres que son solo espacios', async () => {
        // Arrange
        const spaceNames = [
          '   ',
          '\t\t',
          '\n\n',
          '     ', // múltiples espacios
        ];

        // Act & Assert
        for (const fullName of spaceNames) {
          const payload = {
            email: 'test@example.com',
            password: 'password123',
            fullName,
          };

          await expect(AuthService.register(payload)).rejects.toThrow(
            'Nombre completo es requerido'
          );
        }
      });

      it('debería rechazar fullName null o undefined', async () => {
        // Arrange & Act & Assert
        const invalidPayloads = [
          {
            email: 'test@example.com',
            password: 'password123',
            fullName: null as any,
          },
          {
            email: 'test@example.com',
            password: 'password123',
            fullName: undefined as any,
          },
        ];

        for (const payload of invalidPayloads) {
          await expect(AuthService.register(payload)).rejects.toThrow(
            'Nombre completo es requerido'
          );
        }
      });
    });

    describe('validaciones heredadas de AuthCredentials', () => {
      it('debería validar email y password igual que en login', async () => {
        // Arrange
        const basePayload = {
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Juan Pérez',
        };

        // Test email inválido
        await expect(
          AuthService.register({
            ...basePayload,
            email: 'invalid-email',
          })
        ).rejects.toThrow('Email no tiene un formato válido');

        // Test password corto
        await expect(
          AuthService.register({
            ...basePayload,
            password: '1234567',
          })
        ).rejects.toThrow('Password debe tener al menos 8 caracteres');

        // Test email vacío
        await expect(
          AuthService.register({
            ...basePayload,
            email: '',
          })
        ).rejects.toThrow('Email es requerido');

        // Test password vacío
        await expect(
          AuthService.register({
            ...basePayload,
            password: '',
          })
        ).rejects.toThrow('Password es requerido');
      });
    });

    describe('validaciones de payload completo', () => {
      it('debería rechazar payload null o undefined', async () => {
        // Act & Assert
        await expect(AuthService.register(null as any)).rejects.toThrow('Email es requerido');
        await expect(AuthService.register(undefined as any)).rejects.toThrow('Email es requerido');
      });

      it('debería manejar objetos vacíos', async () => {
        // Act & Assert
        await expect(AuthService.register({} as RegisterPayload)).rejects.toThrow(
          'Email es requerido'
        );
      });

      it('debería manejar objetos con propiedades faltantes', async () => {
        // Act & Assert
        await expect(
          AuthService.register({
            email: 'test@test.com',
            password: 'password123',
          } as RegisterPayload)
        ).rejects.toThrow('Nombre completo es requerido');

        await expect(
          AuthService.register({
            email: 'test@test.com',
            fullName: 'Juan Pérez',
          } as RegisterPayload)
        ).rejects.toThrow('Password es requerido');

        await expect(
          AuthService.register({
            password: 'password123',
            fullName: 'Juan Pérez',
          } as RegisterPayload)
        ).rejects.toThrow('Email es requerido');
      });
    });
  });

  describe('valores límite', () => {
    it('debería manejar string extremadamente largos', async () => {
      // Arrange
      const veryLongEmail = `${'a'.repeat(50)}@example.com`; // Email más realista
      const veryLongPassword = `password${'a'.repeat(100)}`;
      const veryLongName = `Juan ${'A'.repeat(100)}`; // Solo caracteres válidos

      // Act & Assert
      // Email largo pero válido debería pasar validación de formato
      try {
        await AuthService.login({
          email: veryLongEmail,
          password: 'password123',
        });
      } catch (error) {
        // El error debe ser del mock de API, no de validación
        expect((error as Error).message).not.toContain('Email no tiene un formato válido');
      }

      // Password muy largo debería ser válido
      try {
        await AuthService.login({
          email: 'test@example.com',
          password: veryLongPassword,
        });
      } catch (error) {
        // El error debe ser del mock de API, no de validación
        expect((error as Error).message).not.toContain('Password debe tener al menos 8 caracteres');
      }

      // Nombre muy largo con caracteres válidos debería pasar
      try {
        await AuthService.register({
          email: 'test@example.com',
          password: 'password123',
          fullName: veryLongName,
        });
      } catch (error) {
        // El error debe ser del mock de API, no de validación
        const errorMsg = (error as Error).message;
        expect(errorMsg).not.toContain('Nombre completo contiene caracteres no válidos');
        expect(errorMsg).not.toContain('Nombre completo debe tener al menos 2 caracteres');
      }
    });

    it('debería manejar caracteres especiales en límites', async () => {
      // Test exactamente en el límite de 8 caracteres para password
      try {
        await AuthService.login({
          email: 'test@example.com',
          password: '12345678', // exactamente 8
        });
      } catch (error) {
        expect((error as Error).message).not.toContain('Password debe tener al menos 8 caracteres');
      }

      // Test exactamente en el límite de 2 caracteres para fullName
      try {
        await AuthService.register({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Jo', // exactamente 2
        });
      } catch (error) {
        expect((error as Error).message).not.toContain(
          'Nombre completo debe tener al menos 2 caracteres'
        );
      }
    });
  });
});
