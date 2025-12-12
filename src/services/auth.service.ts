import { authApi } from '@/api/modules/auth.api';
import type { AuthCredentials, RegisterPayload, AuthResponse } from '@/types/Auth';

/**
 * Valida las credenciales de autenticación
 */
const validateAuthCredentials = (credentials: AuthCredentials): void => {
  if (!credentials?.email?.trim()) {
    throw new Error('Email es requerido');
  }

  if (!credentials?.password?.trim()) {
    throw new Error('Password es requerido');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(credentials.email.trim())) {
    throw new Error('Email no tiene un formato válido');
  }

  if (credentials.password.length < 8) {
    throw new Error('Password debe tener al menos 8 caracteres');
  }
};

/**
 * Valida los datos de registro
 */
const validateRegisterPayload = (payload: RegisterPayload): void => {
  // Usar validación base primero
  validateAuthCredentials(payload);

  if (!payload?.fullName?.trim()) {
    throw new Error('Nombre completo es requerido');
  }

  if (payload.fullName.trim().length < 2) {
    throw new Error('Nombre completo debe tener al menos 2 caracteres');
  }

  // Validar que no tenga caracteres especiales problemáticos
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/;
  if (!nameRegex.test(payload.fullName.trim())) {
    throw new Error('Nombre completo contiene caracteres no válidos');
  }
};

export const AuthService = {
  async login(authCredentials: AuthCredentials): Promise<AuthResponse> {
    // Early return para validaciones
    validateAuthCredentials(authCredentials);

    try {
      // La API ya devuelve los datos extraídos directamente
      return await authApi.login(authCredentials);
    } catch (error: any) {
      // Preservar datos de respuesta del servidor para manejo en el store
      if (error?.response?.data?.message) {
        const preservedError = new Error(error.response.data.message);
        (preservedError as any).response = error.response;
        throw preservedError;
      } else if (error?.response?.message) {
        const preservedError = new Error(error.response.message);
        (preservedError as any).response = error.response;
        throw preservedError;
      } else if (error instanceof Error) {
        throw error;
      }

      throw new Error('Error desconocido durante el login');
    }
  },

  async register(registerPayload: RegisterPayload): Promise<AuthResponse> {
    // Early return para validaciones
    validateRegisterPayload(registerPayload);

    try {
      // La API ya devuelve los datos extraídos directamente
      return await authApi.register(registerPayload);
    } catch (error: any) {
      // Preservar datos de respuesta del servidor para manejo en el store
      if (error?.response?.data?.message) {
        const preservedError = new Error(error.response.data.message);
        (preservedError as any).response = error.response;
        throw preservedError;
      } else if (error?.response?.message) {
        const preservedError = new Error(error.response.message);
        (preservedError as any).response = error.response;
        throw preservedError;
      } else if (error instanceof Error) {
        throw error;
      }

      throw new Error('Error desconocido durante el registro');
    }
  },
};
