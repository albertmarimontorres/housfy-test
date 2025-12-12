import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';
import { AuthService } from '@/services/auth.service';
import { tokenStorage } from '@/utils/tokenStorage';
import type { AuthCredentials, RegisterPayload, AuthResponse } from '@/types/Auth';

// Mock dependencies
vi.mock('@/services/auth.service');
vi.mock('@/utils/tokenStorage');

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>;
  const mockAuthService = AuthService as any;
  const mockTokenStorage = tokenStorage as any;

  beforeEach(() => {
    // Clear all mocks first
    vi.clearAllMocks();

    // Setup default mocks
    mockTokenStorage.get.mockReturnValue(null);
    mockTokenStorage.set.mockImplementation(() => {});
    mockTokenStorage.clear.mockImplementation(() => {});

    // Create fresh Pinia instance for each test
    setActivePinia(createPinia());
    authStore = useAuthStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('debería inicializar con token del storage', () => {
      // Arrange
      vi.clearAllMocks();
      const savedToken = 'saved-token-123';
      mockTokenStorage.get.mockReturnValue(savedToken);

      // Act
      setActivePinia(createPinia());
      const freshStore = useAuthStore();

      // Assert
      expect(freshStore.token).toBe(savedToken);
      expect(freshStore.loading).toBe(false);
      expect(freshStore.error).toBe(null);
    });

    it('debería inicializar sin token si storage está vacío', () => {
      // Arrange
      vi.clearAllMocks();
      mockTokenStorage.get.mockReturnValue(null);

      // Act
      setActivePinia(createPinia());
      const freshStore = useAuthStore();

      // Assert
      expect(freshStore.token).toBe(null);
      expect(freshStore.loading).toBe(false);
      expect(freshStore.error).toBe(null);
    });
  });

  describe('getters', () => {
    describe('isAuthenticated', () => {
      it('debería retornar true cuando hay token', () => {
        // Arrange
        authStore.token = 'valid-token';

        // Act & Assert
        expect(authStore.isAuthenticated).toBe(true);
      });

      it('debería retornar false cuando no hay token', () => {
        // Arrange
        authStore.token = null;

        // Act & Assert
        expect(authStore.isAuthenticated).toBe(false);
      });

      it('debería retornar false cuando token está vacío', () => {
        // Arrange
        authStore.token = '';

        // Act & Assert
        expect(authStore.isAuthenticated).toBe(false);
      });
    });
  });

  describe('actions', () => {
    describe('login', () => {
      const validCredentials: AuthCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const successResponse: AuthResponse = {
        success: true,
        message: 'Login exitoso',
        userId: 123,
        bearer: 'auth-token-123',
      };

      describe('casos de éxito', () => {
        it('debería hacer login exitosamente', async () => {
          // Arrange
          mockAuthService.login.mockResolvedValue(successResponse);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(mockAuthService.login).toHaveBeenCalledWith(validCredentials);
          expect(mockTokenStorage.set).toHaveBeenCalledWith('auth-token-123');
          expect(authStore.token).toBe('auth-token-123');
          expect(authStore.loading).toBe(false);
          expect(authStore.error).toBe(null);
        });

        it('debería manejar estado de loading correctamente', async () => {
          // Arrange
          let loadingDuringExecution = false;
          mockAuthService.login.mockImplementation(async () => {
            loadingDuringExecution = authStore.loading;
            return successResponse;
          });

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(loadingDuringExecution).toBe(true);
          expect(authStore.loading).toBe(false);
        });

        it('debería limpiar errores previos al iniciar login', async () => {
          // Arrange
          authStore.error = 'Previous error';
          mockAuthService.login.mockResolvedValue(successResponse);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe(null);
        });
      });

      describe('casos de error de respuesta', () => {
        it('debería manejar respuesta sin success', async () => {
          // Arrange
          const failureResponse = {
            success: false,
            message: 'Credenciales inválidas',
            userId: 0,
            bearer: '',
          };
          mockAuthService.login.mockResolvedValue(failureResponse);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Credenciales inválidas');
          expect(authStore.token).toBe(null);
          expect(mockTokenStorage.set).not.toHaveBeenCalled();
        });

        it('debería manejar respuesta sin bearer', async () => {
          // Arrange
          const responseWithoutBearer = {
            success: true,
            message: 'Login exitoso',
            userId: 123,
            bearer: '',
          };
          mockAuthService.login.mockResolvedValue(responseWithoutBearer);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Login exitoso');
          expect(authStore.token).toBe(null);
          expect(mockTokenStorage.set).not.toHaveBeenCalled();
        });

        it('debería usar mensaje por defecto si no hay message', async () => {
          // Arrange
          const responseWithoutMessage = {
            success: false,
            message: '',
            userId: 0,
            bearer: '',
          };
          mockAuthService.login.mockResolvedValue(responseWithoutMessage);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Error in login');
        });
      });

      describe('casos de error de servicio', () => {
        it('debería manejar error con mensaje directo', async () => {
          // Arrange
          const error = new Error('Email es requerido');
          mockAuthService.login.mockRejectedValue(error);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Email es requerido');
          expect(authStore.token).toBe(null);
          expect(authStore.loading).toBe(false);
        });

        it('debería manejar error con response.data.message', async () => {
          // Arrange
          const error = {
            response: {
              data: {
                message: 'Error del servidor',
              },
            },
          };
          mockAuthService.login.mockRejectedValue(error);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Error del servidor');
        });

        it('debería manejar error con response.message', async () => {
          // Arrange
          const error = {
            response: {
              message: 'Error de red',
            },
          };
          mockAuthService.login.mockRejectedValue(error);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Error de red');
        });

        it('debería manejar error desconocido', async () => {
          // Arrange
          mockAuthService.login.mockRejectedValue('Unknown error');

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Error desconocido durante el login');
        });

        it('debería manejar error null', async () => {
          // Arrange
          mockAuthService.login.mockRejectedValue(null);

          // Act
          await authStore.login(validCredentials);

          // Assert
          expect(authStore.error).toBe('Error desconocido durante el login');
        });
      });

      describe('edge cases', () => {
        it('debería manejar múltiples llamadas concurrentes', async () => {
          // Arrange
          mockAuthService.login.mockResolvedValueOnce(successResponse).mockResolvedValueOnce({
            ...successResponse,
            bearer: 'second-token',
          });

          // Act
          const promise1 = authStore.login(validCredentials);
          const promise2 = authStore.login(validCredentials);

          await Promise.all([promise1, promise2]);

          // Assert
          expect(authStore.token).toBe('second-token'); // Last one wins
          expect(mockAuthService.login).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe('register', () => {
      const validRegisterPayload: RegisterPayload = {
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'Juan Pérez',
      };

      const successResponse: AuthResponse = {
        success: true,
        message: 'Registro exitoso',
        userId: 456,
        bearer: 'auth-token-456',
      };

      describe('casos de éxito', () => {
        it('debería registrar usuario exitosamente', async () => {
          // Arrange
          mockAuthService.register.mockResolvedValue(successResponse);

          // Act
          await authStore.register(validRegisterPayload);

          // Assert
          expect(mockAuthService.register).toHaveBeenCalledWith(validRegisterPayload);
          expect(mockTokenStorage.set).toHaveBeenCalledWith('auth-token-456');
          expect(authStore.token).toBe('auth-token-456');
          expect(authStore.loading).toBe(false);
          expect(authStore.error).toBe(null);
        });

        it('debería manejar estado de loading correctamente', async () => {
          // Arrange
          let loadingDuringExecution = false;
          mockAuthService.register.mockImplementation(async () => {
            loadingDuringExecution = authStore.loading;
            return successResponse;
          });

          // Act
          await authStore.register(validRegisterPayload);

          // Assert
          expect(loadingDuringExecution).toBe(true);
          expect(authStore.loading).toBe(false);
        });
      });

      describe('casos de error de respuesta', () => {
        it('debería manejar respuesta sin success', async () => {
          // Arrange
          const failureResponse = {
            success: false,
            message: 'Email ya existe',
            userId: 0,
            bearer: '',
          };
          mockAuthService.register.mockResolvedValue(failureResponse);

          // Act
          await authStore.register(validRegisterPayload);

          // Assert
          expect(authStore.error).toBe('Email ya existe');
          expect(authStore.token).toBe(null);
        });

        it('debería usar mensaje por defecto para register', async () => {
          // Arrange
          const responseWithoutMessage = {
            success: false,
            message: '',
            userId: 0,
            bearer: '',
          };
          mockAuthService.register.mockResolvedValue(responseWithoutMessage);

          // Act
          await authStore.register(validRegisterPayload);

          // Assert
          expect(authStore.error).toBe('Error in register');
        });
      });

      describe('casos de error de servicio', () => {
        it('debería manejar error de validación', async () => {
          // Arrange
          const validationError = new Error('Nombre completo es requerido');
          mockAuthService.register.mockRejectedValue(validationError);

          // Act
          await authStore.register(validRegisterPayload);

          // Assert
          expect(authStore.error).toBe('Nombre completo es requerido');
          expect(authStore.token).toBe(null);
        });

        it('debería manejar error desconocido en register', async () => {
          // Arrange
          mockAuthService.register.mockRejectedValue('Unknown register error');

          // Act
          await authStore.register(validRegisterPayload);

          // Assert
          expect(authStore.error).toBe('Error desconocido durante el registro');
        });
      });
    });

    describe('logout', () => {
      it('debería hacer logout correctamente', () => {
        // Arrange
        authStore.token = 'existing-token';

        // Act
        authStore.logout();

        // Assert
        expect(mockTokenStorage.clear).toHaveBeenCalled();
        expect(authStore.token).toBe(null);
      });

      it('debería funcionar aunque no haya token', () => {
        // Arrange
        authStore.token = null;

        // Act
        authStore.logout();

        // Assert
        expect(mockTokenStorage.clear).toHaveBeenCalled();
        expect(authStore.token).toBe(null);
      });

      it('debería no afectar loading y error', () => {
        // Arrange
        authStore.token = 'token';
        authStore.loading = true;
        authStore.error = 'Some error';

        // Act
        authStore.logout();

        // Assert
        expect(authStore.token).toBe(null);
        expect(authStore.loading).toBe(true); // No se modifica
        expect(authStore.error).toBe('Some error'); // No se modifica
      });
    });
  });

  describe('integración completa', () => {
    it('debería manejar flujo completo login -> logout', async () => {
      // Arrange
      const credentials = { email: 'test@test.com', password: 'password123' };
      const response = {
        success: true,
        message: 'Success',
        userId: 123,
        bearer: 'token-123',
      };
      mockAuthService.login.mockResolvedValue(response);

      // Act - Login
      await authStore.login(credentials);

      // Assert - After login
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.token).toBe('token-123');

      // Act - Logout
      authStore.logout();

      // Assert - After logout
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.token).toBe(null);
    });

    it('debería mantener estado consistente después de errores', async () => {
      // Arrange
      const credentials = { email: 'test@test.com', password: 'wrong' };
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      // Act
      await authStore.login(credentials);

      // Assert
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.token).toBe(null);
      expect(authStore.error).toBe('Invalid credentials');
      expect(authStore.loading).toBe(false);
    });
  });

  describe('inicialización con token persistido', () => {
    it('debería recuperar estado después de refresh', () => {
      // Arrange - Crear nueva instancia con mock configurado
      vi.clearAllMocks();
      const savedToken = 'persisted-token';
      mockTokenStorage.get.mockReturnValue(savedToken);

      // Act - Crear nueva instancia completa
      setActivePinia(createPinia());
      const newStore = useAuthStore();

      // Assert
      expect(mockTokenStorage.get).toHaveBeenCalled();
      expect(newStore.token).toBe(savedToken);
      expect(newStore.isAuthenticated).toBe(true);
    });
  });
});
