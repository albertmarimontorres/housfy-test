import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRealEstateStore } from '@/stores/real-estate.store';
import { getRealEstateProperties } from '@/services/real-estate.service';
import type { RealEstateProperty, RealEstateFilters, RealEstateResponse } from '@/types/Property';

// Mock del servicio
vi.mock('@/services/real-estate.service');

describe('Real Estate Store', () => {
  let mockGetRealEstateProperties: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    // Mock del servicio de real estate
    mockGetRealEstateProperties = vi.mocked(getRealEstateProperties);

    // Mock console.log para evitar output durante tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('estado inicial', () => {
    it('debería tener estado inicial correcto', () => {
      // Arrange & Act
      const store = useRealEstateStore();

      // Assert
      expect(store.allProperties).toEqual([]);
      expect(store.filteredProperties).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
      expect(store.filters).toEqual({});
    });

    it('debería tener getters iniciales correctos', () => {
      // Arrange & Act
      const store = useRealEstateStore();

      // Assert
      expect(store.properties).toEqual([]);
      expect(store.propertiesCount).toBe(0);
      expect(store.hasProperties).toBe(false);
      expect(store.propertiesByStatus).toEqual({});
    });
  });

  describe('getters', () => {
    it('debería retornar properties como filteredProperties', () => {
      // Arrange
      const store = useRealEstateStore();
      const mockProperties: RealEstateProperty[] = [
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
      ];

      // Act
      store.filteredProperties = mockProperties;

      // Assert
      expect(store.properties).toEqual(mockProperties);
      expect(store.properties).toBe(store.filteredProperties);
    });

    it('debería calcular propertiesCount correctamente', () => {
      // Arrange
      const store = useRealEstateStore();

      // Act
      store.filteredProperties = [
        {
          uuid: '1',
          propertyStreet: 'Calle A',
          propertyStreetNumber: 1,
          propertyFloor: 1,
          status: 'Publicado',
          propertyPriceMinUnit: 100000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
        {
          uuid: '2',
          propertyStreet: 'Calle B',
          propertyStreetNumber: 2,
          propertyFloor: 2,
          status: 'Reservado',
          propertyPriceMinUnit: 200000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
      ];

      // Assert
      expect(store.propertiesCount).toBe(2);
    });

    it('debería calcular hasProperties correctamente', () => {
      // Arrange
      const store = useRealEstateStore();

      // Act & Assert - sin propiedades
      expect(store.hasProperties).toBe(false);

      // Con propiedades
      store.filteredProperties = [
        {
          uuid: '1',
          propertyStreet: 'Calle A',
          propertyStreetNumber: 1,
          propertyFloor: 1,
          status: 'Publicado',
          propertyPriceMinUnit: 100000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
      ];
      expect(store.hasProperties).toBe(true);
    });

    it('debería agrupar propiedades por status correctamente', () => {
      // Arrange
      const store = useRealEstateStore();

      // Act
      store.filteredProperties = [
        {
          uuid: '1',
          propertyStreet: 'Calle A',
          propertyStreetNumber: 1,
          propertyFloor: 1,
          status: 'Publicado',
          propertyPriceMinUnit: 100000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
        {
          uuid: '2',
          propertyStreet: 'Calle B',
          propertyStreetNumber: 2,
          propertyFloor: 2,
          status: 'Publicado',
          propertyPriceMinUnit: 200000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
        {
          uuid: '3',
          propertyStreet: 'Calle C',
          propertyStreetNumber: 3,
          propertyFloor: 3,
          status: 'Reservado',
          propertyPriceMinUnit: 300000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
      ];

      // Assert
      const grouped = store.propertiesByStatus;
      expect(grouped).toHaveProperty('Publicado');
      expect(grouped).toHaveProperty('Reservado');
      expect(grouped['Publicado']).toHaveLength(2);
      expect(grouped['Reservado']).toHaveLength(1);
      expect(grouped['Publicado']?.[0]?.uuid).toBe('1');
      expect(grouped['Reservado']?.[0]?.uuid).toBe('3');
    });
  });

  describe('fetchProperties', () => {
    describe('casos de éxito', () => {
      it('debería cargar propiedades exitosamente sin filtros', async () => {
        // Arrange
        const store = useRealEstateStore();
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
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

        mockGetRealEstateProperties.mockResolvedValue(mockResponse);

        // Act
        await store.fetchProperties();

        // Assert
        expect(store.allProperties).toEqual(mockResponse.properties);
        expect(store.filteredProperties).toEqual(mockResponse.properties);
        expect(store.error).toBeNull();
        expect(store.loading).toBe(false);
        expect(mockGetRealEstateProperties).toHaveBeenCalledWith();
      });

      it('debería cargar propiedades y aplicar filtros', async () => {
        // Arrange
        const store = useRealEstateStore();
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [
            {
              uuid: '1',
              propertyStreet: 'Calle Mayor',
              propertyStreetNumber: 123,
              propertyFloor: 2,
              status: 'Publicado',
              propertyPriceMinUnit: 250000,
              last_status_changed_at: '2023-01-15T10:30:00Z',
              created_at: '2023-01-01T00:00:00Z',
            },
            {
              uuid: '2',
              propertyStreet: 'Avenida Central',
              propertyStreetNumber: 456,
              propertyFloor: 3,
              status: 'Reservado',
              propertyPriceMinUnit: 180000,
              last_status_changed_at: '2023-02-01T14:20:00Z',
              created_at: '2023-01-15T00:00:00Z',
            },
          ],
        };

        const filters: RealEstateFilters = {
          status: 'Publicado',
        };

        mockGetRealEstateProperties.mockResolvedValue(mockResponse);

        // Act
        await store.fetchProperties(filters);

        // Assert
        expect(store.allProperties).toEqual(mockResponse.properties);
        expect(store.filteredProperties).toHaveLength(1);
        expect(store.filteredProperties[0]?.status).toBe('Publicado');
        expect(store.filters).toEqual(filters);
      });

      it('debería manejar loading states correctamente', async () => {
        // Arrange
        const store = useRealEstateStore();
        const mockResponse: RealEstateResponse = {
          success: true,
          message: 'OK',
          properties: [],
        };

        let resolvePromise: (value: any) => void;
        const promise = new Promise(resolve => {
          resolvePromise = resolve;
        });

        mockGetRealEstateProperties.mockReturnValue(promise);

        // Act
        const fetchPromise = store.fetchProperties();

        // Assert - durante loading
        expect(store.loading).toBe(true);
        expect(store.error).toBe(null);

        // Resolver la promesa
        resolvePromise!(mockResponse);
        await fetchPromise;

        // Assert - después de loading
        expect(store.loading).toBe(false);
      });
    });

    describe('casos de error', () => {
      it('debería manejar respuesta sin success', async () => {
        // Arrange
        const store = useRealEstateStore();
        const mockResponse = {
          success: false,
          message: 'Error del servidor',
          properties: null,
        };

        mockGetRealEstateProperties.mockResolvedValue(mockResponse);

        // Act
        await store.fetchProperties();

        // Assert
        expect(store.allProperties).toEqual([]);
        expect(store.filteredProperties).toEqual([]);
        expect(store.error).toBe('Error del servidor');
        expect(store.loading).toBe(false);
      });

      it('debería manejar respuesta sin properties', async () => {
        // Arrange
        const store = useRealEstateStore();
        const mockResponse = {
          success: true,
          message: 'Respuesta sin propiedades',
          properties: null,
        };

        mockGetRealEstateProperties.mockResolvedValue(mockResponse);

        // Act
        await store.fetchProperties();

        // Assert
        expect(store.allProperties).toEqual([]);
        expect(store.filteredProperties).toEqual([]);
        expect(store.error).toBe('Respuesta sin propiedades');
        expect(store.loading).toBe(false);
      });

      it('debería manejar errores de API', async () => {
        // Arrange
        const store = useRealEstateStore();
        const apiError = new Error('Error de conexión');
        // Simular estructura de error de Axios
        (apiError as any).response = {
          data: {
            message: 'Error de conexión',
          },
        };

        mockGetRealEstateProperties.mockRejectedValue(apiError);

        // Act
        await store.fetchProperties();

        // Assert
        expect(store.allProperties).toEqual([]);
        expect(store.filteredProperties).toEqual([]);
        expect(store.error).toBe('Error de conexión');
        expect(store.loading).toBe(false);
        expect(console.error).toHaveBeenCalledWith(
          'Error fetching real estate properties:',
          apiError
        );
      });

      it('debería manejar errores sin response.data', async () => {
        // Arrange
        const store = useRealEstateStore();
        const networkError = new Error('Network Error');

        mockGetRealEstateProperties.mockRejectedValue(networkError);

        // Act
        await store.fetchProperties();

        // Assert
        expect(store.allProperties).toEqual([]);
        expect(store.filteredProperties).toEqual([]);
        expect(store.error).toBe('Error al obtener las propiedades');
        expect(store.loading).toBe(false);
      });
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      const store = useRealEstateStore();
      // Setup propiedades de prueba
      store.allProperties = [
        {
          uuid: '1',
          propertyStreet: 'Calle Mayor',
          propertyStreetNumber: 123,
          propertyFloor: 2,
          status: 'Publicado',
          propertyPriceMinUnit: 250000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
        {
          uuid: '2',
          propertyStreet: 'Avenida Central',
          propertyStreetNumber: 456,
          propertyFloor: 3,
          status: 'Reservado',
          propertyPriceMinUnit: 180000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
        {
          uuid: '3',
          propertyStreet: 'Plaza del Sol',
          propertyStreetNumber: 789,
          propertyFloor: 1,
          status: 'Publicado',
          propertyPriceMinUnit: 320000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
      ];
      store.filteredProperties = [...store.allProperties];
    });

    it('debería filtrar por status', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = { status: 'Publicado' };

      // Act
      store.applyFilters(filters);

      // Assert
      expect(store.filteredProperties).toHaveLength(2);
      expect(store.filteredProperties.every(p => p.status === 'Publicado')).toBe(true);
      expect(store.filters).toEqual(filters);
    });

    it('debería filtrar por precio mínimo', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = { minPrice: 200000 };

      // Act
      store.applyFilters(filters);

      // Assert
      expect(store.filteredProperties).toHaveLength(2);
      expect(store.filteredProperties.every(p => p.propertyPriceMinUnit >= 200000)).toBe(true);
    });

    it('debería filtrar por precio máximo', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = { maxPrice: 300000 };

      // Act
      store.applyFilters(filters);

      // Assert
      expect(store.filteredProperties).toHaveLength(2);
      expect(store.filteredProperties.every(p => p.propertyPriceMinUnit <= 300000)).toBe(true);
    });

    it('debería filtrar por calle (case insensitive)', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = { propertyStreet: 'mayor' };

      // Act
      store.applyFilters(filters);

      // Assert
      expect(store.filteredProperties).toHaveLength(1);
      expect(store.filteredProperties[0]?.propertyStreet).toBe('Calle Mayor');
    });

    it('debería aplicar múltiples filtros combinados', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = {
        status: 'Publicado',
        minPrice: 300000,
      };

      // Act
      store.applyFilters(filters);

      // Assert
      expect(store.filteredProperties).toHaveLength(1);
      expect(store.filteredProperties[0]?.uuid).toBe('3');
      expect(store.filteredProperties[0]?.status).toBe('Publicado');
      expect(store.filteredProperties[0]?.propertyPriceMinUnit).toBeGreaterThanOrEqual(300000);
    });

    it('debería manejar filtros que no coinciden con ninguna propiedad', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = { status: 'Estado inexistente' };

      // Act
      store.applyFilters(filters);

      // Assert
      expect(store.filteredProperties).toHaveLength(0);
    });

    it('debería manejar valores null/undefined en filtros', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = {
        status: 'Publicado',
        minPrice: null as any,
        maxPrice: undefined,
        propertyStreet: undefined,
      };

      // Act
      store.applyFilters(filters);

      // Assert
      expect(store.filteredProperties).toHaveLength(2);
      expect(store.filteredProperties.every(p => p.status === 'Publicado')).toBe(true);
    });
  });

  describe('acciones auxiliares', () => {
    it('setFilters debería actualizar los filtros', () => {
      // Arrange
      const store = useRealEstateStore();
      const filters: RealEstateFilters = { status: 'Publicado', minPrice: 100000 };

      // Act
      store.setFilters(filters);

      // Assert
      expect(store.filters).toEqual(filters);
    });

    it('clearFilters debería limpiar los filtros', () => {
      // Arrange
      const store = useRealEstateStore();
      store.filters = { status: 'Publicado', minPrice: 100000 };

      // Act
      store.clearFilters();

      // Assert
      expect(store.filters).toEqual({});
    });

    it('clearProperties debería limpiar todo el estado', () => {
      // Arrange
      const store = useRealEstateStore();
      store.allProperties = [
        {
          uuid: '1',
          propertyStreet: 'Test',
          propertyStreetNumber: 1,
          propertyFloor: 1,
          status: 'Test',
          propertyPriceMinUnit: 100000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
      ];
      store.filteredProperties = [...store.allProperties];
      store.error = 'Some error';
      store.filters = { status: 'Test' };

      // Act
      store.clearProperties();

      // Assert
      expect(store.allProperties).toEqual([]);
      expect(store.filteredProperties).toEqual([]);
      expect(store.error).toBe(null);
      expect(store.filters).toEqual({});
    });

    it('getPropertyByUuid debería encontrar propiedad existente', () => {
      // Arrange
      const store = useRealEstateStore();
      const testProperty = {
        uuid: 'test-uuid-123',
        propertyStreet: 'Test Street',
        propertyStreetNumber: 1,
        propertyFloor: 1,
        status: 'Test',
        propertyPriceMinUnit: 100000,
        last_status_changed_at: '2023-01-01',
        created_at: '2023-01-01',
      };
      store.allProperties = [testProperty];

      // Act
      const result = store.getPropertyByUuid('test-uuid-123');

      // Assert
      expect(result).toEqual(testProperty);
    });

    it('getPropertyByUuid debería retornar undefined para UUID no existente', () => {
      // Arrange
      const store = useRealEstateStore();
      store.allProperties = [];

      // Act
      const result = store.getPropertyByUuid('non-existent-uuid');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('reactividad', () => {
    it('debería mantener reactividad en los getters', () => {
      // Arrange
      const store = useRealEstateStore();

      // Act & Assert - estado inicial
      expect(store.hasProperties).toBe(false);
      expect(store.propertiesCount).toBe(0);

      // Cambiar estado
      store.filteredProperties = [
        {
          uuid: '1',
          propertyStreet: 'Test',
          propertyStreetNumber: 1,
          propertyFloor: 1,
          status: 'Test',
          propertyPriceMinUnit: 100000,
          last_status_changed_at: '2023-01-01',
          created_at: '2023-01-01',
        },
      ];

      // Verificar reactividad
      expect(store.hasProperties).toBe(true);
      expect(store.propertiesCount).toBe(1);
    });
  });
});
