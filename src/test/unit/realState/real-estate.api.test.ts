import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { realEstateApi } from '@/api/modules/real-estate.api';
import http from '@/api/httpClient';
import type { RealEstateResponse, RealEstateFilters } from '@/types/Property';

// Mock del httpClient
vi.mock('@/api/httpClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Real Estate API', () => {
  const mockHttp = http as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProperties', () => {
    describe('casos de éxito', () => {
      it('debería obtener propiedades exitosamente sin filtros', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'Propiedades obtenidas correctamente',
          properties: [
            {
              uuid: '123e4567-e89b-12d3-a456-426614174000',
              propertyStreet: 'Calle Mayor',
              propertyStreetNumber: 123,
              propertyFloor: 2,
              status: 'Publicado',
              propertyPriceMinUnit: 250000,
              last_status_changed_at: '2023-01-15T10:30:00Z',
              created_at: '2023-01-01T00:00:00Z',
            },
          ],
        };

        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await realEstateApi.getProperties();

        // Assert
        expect(result).toEqual(mockResponse);
        expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
        expect(mockHttp.get).toHaveBeenCalledTimes(1);
      });

      it('debería obtener propiedades con filtros', async () => {
        // Arrange
        const filters: RealEstateFilters = {
          status: 'Publicado',
          minPrice: 200000,
          maxPrice: 500000,
        };

        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'Propiedades filtradas obtenidas',
          properties: [],
        };

        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await realEstateApi.getProperties(filters);

        // Assert
        expect(result).toEqual(mockResponse);
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/real-estate?status=Publicado&minPrice=200000&maxPrice=500000'
        );
        expect(mockHttp.get).toHaveBeenCalledTimes(1);
      });

      it('debería manejar múltiples propiedades', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'Lista de propiedades',
          properties: [
            {
              uuid: '123e4567-e89b-12d3-a456-426614174001',
              propertyStreet: 'Avenida Central',
              propertyStreetNumber: 456,
              propertyFloor: 3,
              status: 'Publicado',
              propertyPriceMinUnit: 180000,
              last_status_changed_at: '2023-02-01T14:20:00Z',
              created_at: '2023-01-15T00:00:00Z',
            },
            {
              uuid: '123e4567-e89b-12d3-a456-426614174002',
              propertyStreet: 'Plaza del Sol',
              propertyStreetNumber: 789,
              propertyFloor: 1,
              status: 'Con visitas',
              propertyPriceMinUnit: 320000,
              last_status_changed_at: '2023-02-10T16:45:00Z',
              created_at: '2023-01-20T00:00:00Z',
            },
          ],
        };

        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await realEstateApi.getProperties();

        // Assert
        expect(result).toEqual(mockResponse);
        expect(result.properties).toHaveLength(2);
        expect(result.properties[0]?.uuid).toBe('123e4567-e89b-12d3-a456-426614174001');
        expect(result.properties[1]?.status).toBe('Con visitas');
      });

      it('debería manejar respuesta exitosa pero sin propiedades', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'No hay propiedades disponibles',
          properties: [],
        };

        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        const result = await realEstateApi.getProperties();

        // Assert
        expect(result).toEqual(mockResponse);
        expect(result.properties).toHaveLength(0);
      });
    });

    describe('casos de error', () => {
      it('debería manejar error HTTP 404', async () => {
        // Arrange
        const error = {
          response: {
            status: 404,
            data: { message: 'Endpoint no encontrado' },
          },
        };
        mockHttp.get.mockRejectedValue(error);

        // Act & Assert
        await expect(realEstateApi.getProperties()).rejects.toEqual(error);
        expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
      });

      it('debería manejar error HTTP 500', async () => {
        // Arrange
        const error = {
          response: {
            status: 500,
            data: { message: 'Error interno del servidor' },
          },
        };
        mockHttp.get.mockRejectedValue(error);

        // Act & Assert
        await expect(realEstateApi.getProperties()).rejects.toEqual(error);
      });

      it('debería manejar error de red', async () => {
        // Arrange
        const networkError = new Error('Network Error');
        mockHttp.get.mockRejectedValue(networkError);

        // Act & Assert
        await expect(realEstateApi.getProperties()).rejects.toThrow('Network Error');
      });

      it('debería manejar timeout', async () => {
        // Arrange
        const timeoutError = new Error('timeout of 8000ms exceeded');
        mockHttp.get.mockRejectedValue(timeoutError);

        // Act & Assert
        await expect(realEstateApi.getProperties()).rejects.toThrow('timeout of 8000ms exceeded');
      });
    });

    describe('validación de filtros', () => {
      it('debería construir URL sin filtros cuando filters es undefined', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [],
        };
        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        await realEstateApi.getProperties(undefined);

        // Assert
        expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
      });

      it('debería construir URL con filtros válidos', async () => {
        // Arrange
        const filters: RealEstateFilters = {
          status: 'Publicado',
          minPrice: 100000,
          propertyStreet: 'Calle Test',
          propertyFloor: 2,
        };

        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [],
        };
        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        await realEstateApi.getProperties(filters);

        // Assert
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/real-estate?status=Publicado&minPrice=100000&propertyStreet=Calle+Test&propertyFloor=2'
        );
      });

      it('debería filtrar valores undefined, null y vacíos', async () => {
        // Arrange
        const filters: RealEstateFilters = {
          status: 'Publicado',
          minPrice: undefined,
          maxPrice: null as any,
          propertyStreet: '',
          propertyFloor: 3,
        };

        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [],
        };
        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        await realEstateApi.getProperties(filters);

        // Assert
        expect(mockHttp.get).toHaveBeenCalledWith('/real-estate?status=Publicado&propertyFloor=3');
      });

      it('debería manejar filtros con caracteres especiales', async () => {
        // Arrange
        const filters: RealEstateFilters = {
          propertyStreet: 'Calle España & García',
          status: 'Oferta recibida',
        };

        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [],
        };
        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        await realEstateApi.getProperties(filters);

        // Assert
        expect(mockHttp.get).toHaveBeenCalledWith(
          '/real-estate?propertyStreet=Calle+Espa%C3%B1a+%26+Garc%C3%ADa&status=Oferta+recibida'
        );
      });

      it('debería manejar objeto de filtros vacío', async () => {
        // Arrange
        const filters: RealEstateFilters = {};

        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [],
        };
        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        await realEstateApi.getProperties(filters);

        // Assert
        expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
      });
    });

    describe('edge cases', () => {
      it('debería manejar respuesta con data null', async () => {
        // Arrange
        mockHttp.get.mockResolvedValue({ data: null });

        // Act
        const result = await realEstateApi.getProperties();

        // Assert
        expect(result).toBe(null);
      });

      it('debería manejar respuesta vacía', async () => {
        // Arrange
        mockHttp.get.mockResolvedValue({});

        // Act
        const result = await realEstateApi.getProperties();

        // Assert
        expect(result).toBeUndefined();
      });

      it('debería manejar múltiples llamadas concurrentes', async () => {
        // Arrange
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [],
        };
        mockHttp.get.mockResolvedValue({ data: mockResponse });

        // Act
        const promises = [
          realEstateApi.getProperties(),
          realEstateApi.getProperties({ status: 'Publicado' }),
          realEstateApi.getProperties({ minPrice: 100000 }),
        ];

        const results = await Promise.all(promises);

        // Assert
        expect(results).toHaveLength(3);
        results.forEach(result => {
          expect(result).toEqual(mockResponse);
        });
        expect(mockHttp.get).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('buildFilteredUrl function', () => {
    it('debería construir URL base sin filtros', async () => {
      // Arrange
      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'OK',
        properties: [],
      };
      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await realEstateApi.getProperties();

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
    });

    it('debería codificar correctamente parámetros de URL', async () => {
      // Arrange
      const filters: RealEstateFilters = {
        propertyStreet: 'Calle & Avenida #1',
      };

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'OK',
        properties: [],
      };
      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await realEstateApi.getProperties(filters);

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/real-estate?propertyStreet=Calle+%26+Avenida+%231'
      );
    });
  });

  describe('integración con httpClient', () => {
    it('debería hacer request al endpoint correcto', async () => {
      // Arrange
      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'OK',
        properties: [],
      };
      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await realEstateApi.getProperties();

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
      expect(mockHttp.get).toHaveBeenCalledTimes(1);
    });

    it('debería pasar headers y configuración del httpClient', async () => {
      // Arrange
      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'OK',
        properties: [],
      };
      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await realEstateApi.getProperties();

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
      // httpClient ya maneja headers como Authorization automáticamente
    });
  });

  describe('estructura del API', () => {
    it('debería tener método getProperties definido', () => {
      // Assert
      expect(realEstateApi.getProperties).toBeDefined();
      expect(typeof realEstateApi.getProperties).toBe('function');
    });

    it('debería exportar el objeto realEstateApi', () => {
      // Assert
      expect(realEstateApi).toBeDefined();
      expect(typeof realEstateApi).toBe('object');
    });
  });
});
