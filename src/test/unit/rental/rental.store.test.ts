import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRentalStore } from '@/stores/rental.store';
import { getRentals } from '@/services/rental.service';
import type { Rental, RentalsResponse, RentalFilters } from '@/types/Property';

// Mock del servicio
vi.mock('@/services/rental.service');

describe('Rental Store - Coverage Completo', () => {
  let rentalStore: any;
  let mockGetRentals: any;

  const mockRentals: Rental[] = [
    {
      uuid: '1',
      propertyStreet: 'Calle Mayor',
      propertyStreetNumber: 123,
      propertyFloor: 1,
      status: 'Publicado',
      propertyPriceMinUnit: 1000,
      last_status_changed_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
    },
    {
      uuid: '2',
      propertyStreet: 'Avenida Libertad',
      propertyStreetNumber: 456,
      propertyFloor: 2,
      status: 'Solicitud recibida',
      propertyPriceMinUnit: 1200,
      last_status_changed_at: '2023-01-02T00:00:00Z',
      created_at: '2023-01-02T00:00:00Z',
    },
    {
      uuid: '3',
      propertyStreet: 'Plaza Central',
      propertyStreetNumber: 789,
      propertyFloor: 3,
      status: 'Publicado',
      propertyPriceMinUnit: 1500,
      last_status_changed_at: '2023-01-03T00:00:00Z',
      created_at: '2023-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    rentalStore = useRentalStore();
    mockGetRentals = vi.mocked(getRentals);
  });

  describe('Estado inicial', () => {
    it('debería tener estado inicial correcto', () => {
      expect(rentalStore.allRentals).toEqual([]);
      expect(rentalStore.filteredRentals).toEqual([]);
      expect(rentalStore.loading).toBe(false);
      expect(rentalStore.error).toBeNull();
      expect(rentalStore.filters).toEqual({});
    });
  });

  describe('fetchRentals', () => {
    it('debería cargar alquileres exitosamente', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'OK',
        properties: mockRentals,
      };
      mockGetRentals.mockResolvedValue(mockResponse);

      // Act
      await rentalStore.fetchRentals();

      // Assert
      expect(rentalStore.loading).toBe(false);
      expect(rentalStore.error).toBeNull();
      expect(rentalStore.allRentals).toEqual(mockRentals);
      expect(rentalStore.filteredRentals).toEqual(mockRentals);
    });

    it('debería manejar respuesta sin success', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        message: 'Error del servidor',
        properties: [],
      };
      mockGetRentals.mockResolvedValue(mockResponse);

      // Act
      await rentalStore.fetchRentals();

      // Assert
      expect(rentalStore.error).toBe('Error del servidor');
      expect(rentalStore.allRentals).toEqual([]);
      expect(rentalStore.filteredRentals).toEqual([]);
    });

    it('debería manejar respuesta sin message', async () => {
      // Arrange
      const mockResponse = {
        success: false,
        message: '',
        properties: [],
      };
      mockGetRentals.mockResolvedValue(mockResponse);

      // Act
      await rentalStore.fetchRentals();

      // Assert
      expect(rentalStore.error).toBe('No se pudieron obtener los alquileres');
    });

    it('debería manejar errores de servicio', async () => {
      // Arrange
      mockGetRentals.mockRejectedValue(new Error('Network error'));

      // Act
      await rentalStore.fetchRentals();

      // Assert
      expect(rentalStore.error).toBe('Error al obtener los alquileres');
      expect(rentalStore.allRentals).toEqual([]);
    });

    it('debería aplicar filtros después de cargar', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'OK',
        properties: mockRentals,
      };
      mockGetRentals.mockResolvedValue(mockResponse);

      const filters: RentalFilters = { status: 'Publicado' };

      // Act
      await rentalStore.fetchRentals(filters);

      // Assert
      expect(rentalStore.allRentals).toEqual(mockRentals);
      expect(rentalStore.filteredRentals).toHaveLength(2); // Solo los publicados
      expect(rentalStore.filteredRentals.every((r: Rental) => r.status === 'Publicado')).toBe(true);
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      // Configurar datos de prueba
      rentalStore.filteredRentals = mockRentals;
    });

    it('debería devolver rentals correctamente', () => {
      expect(rentalStore.rentals).toEqual(mockRentals);
    });

    it('debería filtrar activeRentals correctamente', () => {
      const activeRentals = rentalStore.activeRentals;

      expect(activeRentals).toHaveLength(2);
      expect(activeRentals.every((rental: Rental) => rental.status === 'Publicado')).toBe(true);
    });

    it('debería contar rentalsCount correctamente', () => {
      expect(rentalStore.rentalsCount).toBe(3);
    });

    it('debería calcular hasRentals correctamente', () => {
      expect(rentalStore.hasRentals).toBe(true);

      // Test con array vacío
      rentalStore.filteredRentals = [];
      expect(rentalStore.hasRentals).toBe(false);
    });

    it('debería agrupar rentalsByStatus correctamente', () => {
      const rentalsByStatus = rentalStore.rentalsByStatus;

      expect(rentalsByStatus['Publicado']).toHaveLength(2);
      expect(rentalsByStatus['Solicitud recibida']).toHaveLength(1);
      expect(Object.keys(rentalsByStatus)).toHaveLength(2);
    });

    it('debería manejar status undefined en rentalsByStatus', () => {
      // Arrange
      const rentalWithoutStatus = {
        ...mockRentals[0],
        status: undefined as any,
      };
      rentalStore.filteredRentals = [rentalWithoutStatus];

      // Act
      const rentalsByStatus = rentalStore.rentalsByStatus;

      // Assert
      expect(rentalsByStatus['unknown']).toHaveLength(1);
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      rentalStore.allRentals = mockRentals;
    });

    it('debería filtrar por status', () => {
      // Act
      rentalStore.applyFilters({ status: 'Publicado' });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(2);
      expect(rentalStore.filteredRentals.every((r: Rental) => r.status === 'Publicado')).toBe(true);
      expect(rentalStore.filters.status).toBe('Publicado');
    });

    it('debería filtrar por calle (case insensitive)', () => {
      // Act
      rentalStore.applyFilters({ propertyStreet: 'mayor' });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(1);
      expect(rentalStore.filteredRentals[0].propertyStreet).toBe('Calle Mayor');
    });

    it('debería filtrar por precio mínimo', () => {
      // Act
      rentalStore.applyFilters({ minPrice: 1200 });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(2);
      expect(rentalStore.filteredRentals.every((r: Rental) => r.propertyPriceMinUnit >= 1200)).toBe(
        true
      );
    });

    it('debería filtrar por precio máximo', () => {
      // Act
      rentalStore.applyFilters({ maxPrice: 1200 });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(2);
      expect(rentalStore.filteredRentals.every((r: Rental) => r.propertyPriceMinUnit <= 1200)).toBe(
        true
      );
    });

    it('debería manejar minPrice 0', () => {
      // Act
      rentalStore.applyFilters({ minPrice: 0 });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(3); // Incluye todos
    });

    it('debería manejar maxPrice 0', () => {
      // Act
      rentalStore.applyFilters({ maxPrice: 0 });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(0); // Excluye todos
    });

    it('debería aplicar múltiples filtros combinados', () => {
      // Act
      rentalStore.applyFilters({
        status: 'Publicado',
        minPrice: 1400,
        propertyStreet: 'central',
      });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(1);
      expect(rentalStore.filteredRentals[0].uuid).toBe('3');
    });

    it('debería manejar filtros sin resultados', () => {
      // Act
      rentalStore.applyFilters({ status: 'No existe' });

      // Assert
      expect(rentalStore.filteredRentals).toHaveLength(0);
    });
  });

  describe('Acciones de filtros', () => {
    it('debería establecer filtros con setFilters', () => {
      // Arrange
      const filters: RentalFilters = {
        status: 'Publicado',
        minPrice: 500,
        maxPrice: 2000,
      };

      // Act
      rentalStore.setFilters(filters);

      // Assert
      expect(rentalStore.filters).toEqual(filters);
    });

    it('debería limpiar filtros', () => {
      // Arrange
      rentalStore.filters = { status: 'Publicado', minPrice: 500 };

      // Act
      rentalStore.clearFilters();

      // Assert
      expect(rentalStore.filters).toEqual({});
    });

    it('debería limpiar todos los datos', () => {
      // Arrange
      rentalStore.allRentals = mockRentals;
      rentalStore.filteredRentals = mockRentals;
      rentalStore.error = 'Test error';
      rentalStore.filters = { status: 'Publicado' };

      // Act
      rentalStore.clearRentals();

      // Assert
      expect(rentalStore.allRentals).toEqual([]);
      expect(rentalStore.filteredRentals).toEqual([]);
      expect(rentalStore.error).toBeNull();
      expect(rentalStore.filters).toEqual({});
    });
  });

  describe('Estados de carga', () => {
    it('debería manejar loading correctamente', async () => {
      // Arrange
      let resolvePromise: any;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockGetRentals.mockReturnValue(promise);

      // Act
      const fetchPromise = rentalStore.fetchRentals();

      // Assert - durante la carga
      expect(rentalStore.loading).toBe(true);

      // Completar la promesa
      resolvePromise({
        success: true,
        message: 'OK',
        properties: [],
      });
      await fetchPromise;

      // Assert - después de la carga
      expect(rentalStore.loading).toBe(false);
    });
  });
});
