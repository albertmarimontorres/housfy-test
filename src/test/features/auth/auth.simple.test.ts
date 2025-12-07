import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { authApi } from '@/api/modules/auth.api';

// Mock del auth.api
vi.mock('@/api/modules/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  }
}));

describe('AuthService - Tests Básicos', () => {
  const mockAuthApi = authApi as any;
  
  beforeEach(() => {
    // Configurar mocks para que resuelvan exitosamente
    mockAuthApi.login.mockResolvedValue({
      success: true,
      message: 'Login exitoso',
      userId: 123,
      bearer: 'mock-token'
    });
    
    mockAuthApi.register.mockResolvedValue({
      success: true,
      message: 'Registro exitoso',
      userId: 456,
      bearer: 'mock-token'
    });
  });

  it('debería lanzar error con email inválido simple', async () => {
    const invalidCredentials = { 
      email: 'invalid-email', 
      password: 'password123' 
    };
    
    await expect(AuthService.login(invalidCredentials))
      .rejects
      .toThrow('Email no tiene un formato válido');
  });

  it('debería lanzar error con password muy corto', async () => {
    const invalidCredentials = { 
      email: 'test@example.com', 
      password: '123' 
    };
    
    await expect(AuthService.login(invalidCredentials))
      .rejects
      .toThrow('Password debe tener al menos 8 caracteres');
  });

  it('debería lanzar error con nombre que contiene números', async () => {
    const invalidPayload = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Juan123'
    };
    
    await expect(AuthService.register(invalidPayload))
      .rejects
      .toThrow('Nombre completo contiene caracteres no válidos');
  });

  it('debería pasar validación con string largo válido y resolver exitosamente', async () => {
    const longValidCredentials = {
      email: 'test@example.com',
      password: 'password123' + 'a'.repeat(50)
    };
    
    // Debe pasar validación y llegar a la API mockeada
    const result = await AuthService.login(longValidCredentials);
    
    // Verificar que se resolvió exitosamente (no falló por validación)
    expect(result).toEqual({
      success: true,
      message: 'Login exitoso',
      userId: 123,
      bearer: 'mock-token'
    });
    
    // Verificar que la API fue llamada (validación pasó)
    expect(mockAuthApi.login).toHaveBeenCalledWith(longValidCredentials);
  });
});