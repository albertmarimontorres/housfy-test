import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('httpClient Tests', () => {
  let mockAxiosInstance: any;
  let requestInterceptor: any;
  let responseInterceptor: any;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Reset interceptors
    requestInterceptor = null;
    responseInterceptor = null;

    // Create mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: {
          use: vi.fn((success, error) => {
            requestInterceptor = { success, error };
          })
        },
        response: {
          use: vi.fn((success, error) => {
            responseInterceptor = { success, error };
          })
        }
      }
    };

    // Mock axios
    vi.doMock('axios', () => ({
      default: {
        create: vi.fn(() => mockAxiosInstance)
      }
    }));

    // Mock tokenStorage
    vi.doMock('@/utils/tokenStorage', () => ({
      tokenStorage: {
        get: vi.fn(),
        clear: vi.fn()
      }
    }));

    // Mock environment variables
    vi.stubGlobal('import.meta', {
      env: {
        VITE_HOUSFY_BASE_URL: 'https://n8n.housfy.com/webhook',
        VITE_HOUSFY_ID: 'fee91763-ee96-4f64-8be2-a13f082d37e4'
      }
    });

    // Mock window.location
    const mockLocation = {
      pathname: '/',
      href: ''
    };
    vi.stubGlobal('window', { location: mockLocation });
  });

  describe('configuración inicial', () => {
    it('debería configurar axios correctamente', async () => {
      const axios = await import('axios');
      await import('@/api/httpClient');
      
      expect(axios.default.create).toHaveBeenCalledWith({
        baseURL: 'https://n8n.housfy.com/webhook',
        timeout: 8000,
        withCredentials: false
      });
    });

    it('debería registrar interceptors', async () => {
      await import('@/api/httpClient');
      
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
      expect(requestInterceptor).not.toBeNull();
      expect(responseInterceptor).not.toBeNull();
    });
  });

  describe('request interceptor', () => {
    beforeEach(async () => {
      await import('@/api/httpClient');
    });

    it('debería agregar x-housfy-authorization header', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      (tokenStorage.get as any).mockReturnValue(null);

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(result.headers['x-housfy-authorization']).toBe('fee91763-ee96-4f64-8be2-a13f082d37e4');
    });

    it('debería agregar Authorization header cuando hay token', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      (tokenStorage.get as any).mockReturnValue('test-token');

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
      expect(result.headers['x-housfy-authorization']).toBe('fee91763-ee96-4f64-8be2-a13f082d37e4');
    });

    it('debería no agregar Authorization header sin token', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      (tokenStorage.get as any).mockReturnValue(null);

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('debería no agregar Authorization header con token vacío', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      (tokenStorage.get as any).mockReturnValue('');

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('debería rechazar promesa en caso de error', async () => {
      const error = new Error('Request error');
      
      await expect(requestInterceptor.error(error)).rejects.toBe(error);
    });
  });

  describe('response interceptor', () => {
    beforeEach(async () => {
      await import('@/api/httpClient');
    });

    it('debería devolver response sin modificación en caso exitoso', async () => {
      const response = { data: { success: true }, status: 200 };
      
      const result = responseInterceptor.success(response);
      
      expect(result).toBe(response);
    });

    it('debería manejar error 401 y limpiar token', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      
      const error = {
        response: { status: 401 }
      };
      
      window.location.pathname = '/dashboard';
      window.location.href = '';

      await expect(responseInterceptor.error(error)).rejects.toBe(error);
      expect(tokenStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('debería no redirigir si ya está en login', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      
      const error = {
        response: { status: 401 }
      };
      
      window.location.pathname = '/login';
      window.location.href = '';

      await expect(responseInterceptor.error(error)).rejects.toBe(error);
      expect(tokenStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('debería no redirigir si ya está en register', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      
      const error = {
        response: { status: 401 }
      };
      
      window.location.pathname = '/register';
      window.location.href = '';

      await expect(responseInterceptor.error(error)).rejects.toBe(error);
      expect(tokenStorage.clear).toHaveBeenCalled();
      expect(window.location.href).toBe('');
    });

    it('debería no procesar errores que no sean 401', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      
      const error = {
        response: { status: 500 }
      };

      await expect(responseInterceptor.error(error)).rejects.toBe(error);
      expect(tokenStorage.clear).not.toHaveBeenCalled();
    });

    it('debería manejar errores sin response', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      
      const error = { message: 'Network Error' };

      await expect(responseInterceptor.error(error)).rejects.toBe(error);
      expect(tokenStorage.clear).not.toHaveBeenCalled();
    });

    it('debería manejar errores con response pero sin status', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      
      const error = { response: {} };

      await expect(responseInterceptor.error(error)).rejects.toBe(error);
      expect(tokenStorage.clear).not.toHaveBeenCalled();
    });
  });

  describe('casos edge', () => {
    beforeEach(async () => {
      await import('@/api/httpClient');
    });

    it('debería manejar config con headers null', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      (tokenStorage.get as any).mockReturnValue('test-token');

      const config = { headers: null };
      const result = requestInterceptor.success(config);

      expect(result.headers).toBeDefined();
      expect(result.headers['x-housfy-authorization']).toBe('fee91763-ee96-4f64-8be2-a13f082d37e4');
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('debería manejar config sin headers', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      (tokenStorage.get as any).mockReturnValue('test-token');

      const config = {};
      const result = requestInterceptor.success(config);

      expect(result.headers).toBeDefined();
      expect(result.headers.Authorization).toBe('Bearer test-token');
      expect(result.headers['x-housfy-authorization']).toBe('fee91763-ee96-4f64-8be2-a13f082d37e4');
    });

    it('debería manejar config sin headers y sin token', async () => {
      const { tokenStorage } = await import('@/utils/tokenStorage');
      (tokenStorage.get as any).mockReturnValue(null);

      const config = {};
      const result = requestInterceptor.success(config);

      expect(result.headers).toBeDefined();
      expect(result.headers['x-housfy-authorization']).toBe('fee91763-ee96-4f64-8be2-a13f082d37e4');
      expect(result.headers.Authorization).toBeUndefined();
    });
  });
});
