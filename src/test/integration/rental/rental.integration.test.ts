import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRentalStore } from '@/stores/rental.store';
import { RentalService } from '@/services/rental.service';
import { rentalApi } from '@/api/modules/rental.api';
import http from '@/api/httpClient';
import type { RentalsResponse, Rental } from '@/types/Property';

// Mocks
vi.mock('@/api/httpClient');
vi.mock('@/services/property.service');

describe('Rental - Integración E2E', () => {
  let rentalStore: ReturnType<typeof useRentalStore>;
  let mockHttp: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    rentalStore = useRentalStore();
    mockHttp = vi.mocked(http);
  });

  describe('Flujo completo: Store → Service → API → HTTP', () => {
    it('debería obtener alquileres desde HTTP hasta Store', async () => {
      // Arrange - Mock HTTP response
      const mockRentals: Rental[] = [
        {
          uuid: '123e4567-e89b-12d3-a456-426614174000',
          propertyStreet: 'Calle Mayor',
          propertyStreetNumber: 123,
          propertyFloor: 2,
          status: 'Publicado',
          propertyPriceMinUnit: 1200,
          last_status_changed_at: '2023-01-15T10:30:00Z',
          created_at: '2023-01-01T00:00:00Z'
        }
      ];

      const httpResponse: RentalsResponse = {
        success: true,
        message: 'Alquileres obtenidos',
        properties: mockRentals
      };

      mockHttp.get.mockResolvedValue({ data: httpResponse });

      // Act - Flujo completo
      await rentalStore.fetchRentals();

      // Assert - Verificar toda la cadena
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals');
      expect(rentalStore.allRentals).toEqual(mockRentals);
      expect(rentalStore.filteredRentals).toEqual(mockRentals);
      expect(rentalStore.error).toBeNull();
    });

    it('debería propagar errores desde HTTP hasta Store', async () => {
      // Arrange
      const httpError = new Error('Error de conexión');
      mockHttp.get.mockRejectedValue(httpError);
      
      // Spy en console.error para verificar que se logee el error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await rentalStore.fetchRentals();

      // Assert
      expect(rentalStore.error).toBe('Error al obtener los alquileres');
      expect(rentalStore.allRentals).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching rentals:', httpError);
      
      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integración Service ↔ API', () => {
    it('debería usar API correctamente desde Service', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'Test response',
        properties: []
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await RentalService.getRentals();

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Integración API ↔ HTTP', () => {
    it('debería construir URL correctamente', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'OK',
        properties: []
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await rentalApi.getRentals();

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals');
    });

    it('debería manejar filtros en URL', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'Filtered',
        properties: []
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await rentalApi.getRentals({ status: 'Publicado' });

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals?status=Publicado');
    });
  });

  describe('Casos de error integrados', () => {
    it('debería manejar respuesta malformada', async () => {
      // Arrange
      const badResponse = { invalid: 'data' };
      mockHttp.get.mockResolvedValue({ data: badResponse });

      // Act
      await rentalStore.fetchRentals();

      // Assert - Store maneja graciosamente datos inesperados
      expect(rentalStore.error).toContain('No se pudieron obtener los alquileres');
    });

    it('debería manejar timeout de red', async () => {
      // Arrange
      const timeoutError = new Error('Network timeout');
      mockHttp.get.mockRejectedValue(timeoutError);
      
      // Spy en console.error para verificar que se logee el error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      await rentalStore.fetchRentals();

      // Assert
      expect(rentalStore.error).toBe('Error al obtener los alquileres');
      expect(rentalStore.loading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching rentals:', timeoutError);
      
      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Flujos de datos complejos', () => {
    it('debería manejar múltiples alquileres correctamente', async () => {
      // Arrange
      const multipleRentals: Rental[] = [
        {
          uuid: '123',
          propertyStreet: 'Calle A',
          propertyStreetNumber: 1,
          propertyFloor: 1,
          status: 'Publicado',
          propertyPriceMinUnit: 800,
          last_status_changed_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z'
        },
        {
          uuid: '456',
          propertyStreet: 'Calle B',
          propertyStreetNumber: 2,
          propertyFloor: 2,
          status: 'Solicitud recibida',
          propertyPriceMinUnit: 1200,
          last_status_changed_at: '2023-01-02T00:00:00Z',
          created_at: '2023-01-02T00:00:00Z'
        }
      ];

      const httpResponse: RentalsResponse = {
        success: true,
        message: 'Multiple rentals',
        properties: multipleRentals
      };

      mockHttp.get.mockResolvedValue({ data: httpResponse });

      // Act
      await rentalStore.fetchRentals();

      // Assert
      expect(rentalStore.allRentals).toHaveLength(2);
      expect(rentalStore.rentalsCount).toBe(2);
      expect(rentalStore.hasRentals).toBe(true);
    });
  });
});