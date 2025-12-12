import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRealEstateStore } from '@/stores/real-estate.store';
import { RealEstateService } from '@/services/real-estate.service';
import { realEstateApi } from '@/api/modules/real-estate.api';
import type { RealEstateResponse, RealEstateFilters } from '@/types/Property';

// Integration test - no mockear las dependencias internas
vi.mock('@/api/httpClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('Real Estate - Tests de Integración', () => {
  let mockHttp: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    // Solo mockear httpClient para controlar las respuestas de red
    const httpModule = await import('@/api/httpClient');
    mockHttp = httpModule.default as any;

    // Mock console para evitar output durante tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flujo completo: Store → Service → API → HTTP', () => {
    it('debería completar flujo exitoso end-to-end', async () => {
      // Arrange
      const store = useRealEstateStore();
      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Propiedades cargadas exitosamente',
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
          {
            uuid: '987fcdeb-51a2-43d1-9c72-534261847b12',
            propertyStreet: 'Avenida Central',
            propertyStreetNumber: 456,
            propertyFloor: 3,
            status: 'Con visitas',
            propertyPriceMinUnit: 180000,
            last_status_changed_at: '2023-02-01T14:20:00Z',
            created_at: '2023-01-15T00:00:00Z',
          },
        ],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await store.fetchProperties();

      // Assert - verificar que el flujo completo funcionó
      expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
      expect(store.allProperties).toHaveLength(2);
      expect(store.filteredProperties).toHaveLength(2);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);

      // Verificar que los datos llegaron correctamente desde HTTP hasta Store
      expect(store.allProperties[0]?.uuid).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(store.allProperties[1]?.propertyStreet).toBe('Avenida Central');
    });

    it('debería manejar flujo con filtros end-to-end', async () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = {
        status: 'Publicado',
        minPrice: 200000,
      };

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Propiedades filtradas',
        properties: [
          {
            uuid: '1',
            propertyStreet: 'Calle A',
            propertyStreetNumber: 1,
            propertyFloor: 1,
            status: 'Publicado',
            propertyPriceMinUnit: 250000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
          {
            uuid: '2',
            propertyStreet: 'Calle B',
            propertyStreetNumber: 2,
            propertyFloor: 2,
            status: 'Reservado',
            propertyPriceMinUnit: 150000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await store.fetchProperties(filters);

      // Assert - verificar filtrado en frontend
      expect(store.allProperties).toHaveLength(2);
      expect(store.filteredProperties).toHaveLength(1); // Solo 'Publicado' con precio >= 200000
      expect(store.filteredProperties[0]?.status).toBe('Publicado');
      expect(store.filteredProperties[0]?.propertyPriceMinUnit).toBeGreaterThanOrEqual(200000);
    });

    it('debería propagar errores end-to-end', async () => {
      // Arrange
      const store = useRealEstateStore();
      const httpError = new Error('Network Error');
      // Simular estructura de error de Axios
      (httpError as any).response = {
        data: {
          message: 'Error de servidor',
        },
      };

      mockHttp.get.mockRejectedValue(httpError);

      // Act
      await store.fetchProperties();

      // Assert - verificar propagación de error
      expect(store.allProperties).toEqual([]);
      expect(store.filteredProperties).toEqual([]);
      expect(store.error).toBe('Error de servidor');
      expect(store.loading).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching real estate properties:',
        httpError
      );
    });
  });

  describe('integración Service ↔ API', () => {
    it('debería integrar correctamente Service con API', async () => {
      // Arrange
      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Service integration test',
        properties: [
          {
            uuid: 'service-test-uuid',
            propertyStreet: 'Service Test Street',
            propertyStreetNumber: 100,
            propertyFloor: 1,
            status: 'Publicado',
            propertyPriceMinUnit: 300000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act - usar directamente el servicio
      const result = await RealEstateService.getProperties();

      // Assert - verificar que API y Service trabajen juntos
      expect(mockHttp.get).toHaveBeenCalledWith('/real-estate');
      expect(result).toEqual(mockResponse);
      expect(result.properties).toHaveLength(1);
      expect(result.properties[0]?.uuid).toBe('service-test-uuid');
    });

    it('debería manejar filtros en la integración Service-API', async () => {
      // Arrange
      const filters: RealEstateFilters = {
        status: 'Con visitas',
        propertyStreet: 'Test',
      };

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Filtered response',
        properties: [],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await RealEstateService.getProperties(filters);

      // Assert - verificar que los filtros se pasan correctamente
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/real-estate?status=Con+visitas&propertyStreet=Test'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('integración directa con API', () => {
    it('debería construir URLs correctamente en la integración', async () => {
      // Arrange
      const complexFilters: RealEstateFilters = {
        status: 'Oferta recibida',
        minPrice: 100000,
        maxPrice: 500000,
        propertyStreet: 'Calle España & García',
        propertyFloor: 3,
      };

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Complex filter test',
        properties: [],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await realEstateApi.getProperties(complexFilters);

      // Assert - verificar encoding correcto de parámetros
      const expectedUrl =
        '/real-estate?status=Oferta+recibida&minPrice=100000&maxPrice=500000&propertyStreet=Calle+Espa%C3%B1a+%26+Garc%C3%ADa&propertyFloor=3';
      expect(mockHttp.get).toHaveBeenCalledWith(expectedUrl);
    });

    it('debería manejar caracteres especiales en filtros', async () => {
      // Arrange
      const specialFilters: RealEstateFilters = {
        propertyStreet: 'Calle & Avenida #1 (Centro)',
      };

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Special chars test',
        properties: [],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await realEstateApi.getProperties(specialFilters);

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/real-estate?propertyStreet=Calle+%26+Avenida+%231+%28Centro%29'
      );
    });
  });

  describe('escenarios de error integrados', () => {
    it('debería manejar timeout en toda la cadena', async () => {
      // Arrange
      const store = useRealEstateStore();
      const timeoutError = new Error('timeout of 8000ms exceeded');

      mockHttp.get.mockRejectedValue(timeoutError);

      // Act
      await store.fetchProperties();

      // Assert
      expect(store.error).toBe('Error al obtener las propiedades');
      expect(store.allProperties).toEqual([]);
      expect(store.filteredProperties).toEqual([]);
      expect(store.loading).toBe(false);
    });

    it('debería manejar respuesta malformada', async () => {
      // Arrange
      const store = useRealEstateStore();
      mockHttp.get.mockResolvedValue({ data: null });

      // Act
      await store.fetchProperties();

      // Assert
      expect(store.error).toBe('No se pudieron obtener las propiedades');
      expect(store.allProperties).toEqual([]);
    });

    it('debería manejar error de Service y propagarlo al Store', async () => {
      // Arrange
      const store = useRealEstateStore();
      const serviceError = new Error('Service specific error');

      mockHttp.get.mockRejectedValue(serviceError);

      // Act
      await store.fetchProperties();

      // Assert
      expect(store.error).toBe('Error al obtener las propiedades');
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching real estate properties:',
        serviceError
      );
    });
  });

  describe('flujos de datos complejos', () => {
    it('debería manejar múltiples operaciones concurrentes', async () => {
      // Arrange
      const store1 = useRealEstateStore();
      const store2 = useRealEstateStore(); // Misma instancia de store

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Concurrent test',
        properties: [
          {
            uuid: 'concurrent-uuid',
            propertyStreet: 'Concurrent Street',
            propertyStreetNumber: 1,
            propertyFloor: 1,
            status: 'Publicado',
            propertyPriceMinUnit: 100000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act - operaciones concurrentes
      await Promise.all([
        store1.fetchProperties(),
        store2.fetchProperties({ status: 'Publicado' }),
      ]);

      // Assert - ambas operaciones deben completarse
      expect(store1.allProperties).toHaveLength(1);
      expect(store2.allProperties).toHaveLength(1);
      expect(store1).toBe(store2); // Misma instancia de store
    });

    it('debería mantener consistencia en operaciones secuenciales', async () => {
      // Arrange
      const store = useRealEstateStore();

      const mockResponse1: RealEstateResponse = {
        success: true,
        message: 'First load',
        properties: [
          {
            uuid: '1',
            propertyStreet: 'Street 1',
            propertyStreetNumber: 1,
            propertyFloor: 1,
            status: 'Publicado',
            propertyPriceMinUnit: 100000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      const mockResponse2: RealEstateResponse = {
        success: true,
        message: 'Second load',
        properties: [
          {
            uuid: '2',
            propertyStreet: 'Street 2',
            propertyStreetNumber: 2,
            propertyFloor: 2,
            status: 'Reservado',
            propertyPriceMinUnit: 200000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      // Act - operaciones secuenciales
      mockHttp.get.mockResolvedValueOnce({ data: mockResponse1 });
      await store.fetchProperties();

      expect(store.allProperties).toHaveLength(1);
      expect(store.allProperties[0]?.uuid).toBe('1');

      mockHttp.get.mockResolvedValueOnce({ data: mockResponse2 });
      await store.fetchProperties({ status: 'Reservado' });

      // Assert - segunda carga debe reemplazar la primera
      expect(store.allProperties).toHaveLength(1);
      expect(store.allProperties[0]?.uuid).toBe('2');
      expect(store.filteredProperties[0]?.status).toBe('Reservado');
    });
  });

  describe('validación end-to-end de funciones auxiliares', () => {
    it('debería integrar getPropertyByUuid con datos reales', async () => {
      // Arrange
      const store = useRealEstateStore();
      const targetUuid = 'target-uuid-123';

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Properties with target',
        properties: [
          {
            uuid: targetUuid,
            propertyStreet: 'Target Street',
            propertyStreetNumber: 123,
            propertyFloor: 2,
            status: 'Publicado',
            propertyPriceMinUnit: 250000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
          {
            uuid: 'other-uuid',
            propertyStreet: 'Other Street',
            propertyStreetNumber: 456,
            propertyFloor: 3,
            status: 'Reservado',
            propertyPriceMinUnit: 180000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await store.fetchProperties();
      const foundProperty = store.getPropertyByUuid(targetUuid);

      // Assert
      expect(foundProperty).toBeDefined();
      expect(foundProperty?.uuid).toBe(targetUuid);
      expect(foundProperty?.propertyStreet).toBe('Target Street');
    });

    it('debería integrar filtros complejos con datos reales', async () => {
      // Arrange
      const store = useRealEstateStore();

      const mockResponse: RealEstateResponse = {
        success: true,
        message: 'Complex filter integration',
        properties: [
          {
            uuid: '1',
            propertyStreet: 'Calle Mayor',
            propertyStreetNumber: 1,
            propertyFloor: 1,
            status: 'Publicado',
            propertyPriceMinUnit: 150000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
          {
            uuid: '2',
            propertyStreet: 'Avenida Mayor',
            propertyStreetNumber: 2,
            propertyFloor: 2,
            status: 'Publicado',
            propertyPriceMinUnit: 250000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
          {
            uuid: '3',
            propertyStreet: 'Calle Menor',
            propertyStreetNumber: 3,
            propertyFloor: 1,
            status: 'Reservado',
            propertyPriceMinUnit: 200000,
            last_status_changed_at: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      const complexFilters: RealEstateFilters = {
        status: 'Publicado',
        minPrice: 200000,
        propertyStreet: 'mayor',
      };

      // Act
      await store.fetchProperties(complexFilters);

      // Assert - solo debe quedar propiedad 2: Publicado + precio >= 200000 + contiene "mayor"
      expect(store.filteredProperties).toHaveLength(1);
      expect(store.filteredProperties[0]?.uuid).toBe('2');
      expect(store.filteredProperties[0]?.status).toBe('Publicado');
      expect(store.filteredProperties[0]?.propertyPriceMinUnit).toBeGreaterThanOrEqual(200000);
      expect(store.filteredProperties[0]?.propertyStreet.toLowerCase()).toContain('mayor');
    });
  });
});
