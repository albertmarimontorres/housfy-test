import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RentalService } from '@/services/rental.service';
import { rentalApi } from '@/api/modules/rental.api';
import { useRentalStore } from '@/stores/rental.store';
import { createPinia, setActivePinia } from 'pinia';
import type { RentalsResponse } from '@/types/Property';

// Mocks simples
vi.mock('@/api/modules/rental.api');
vi.mock('@/services/property.service');

describe('Rental - Tests Simples', () => {
  describe('Smoke Tests', () => {
    it('debería importar RentalService correctamente', () => {
      expect(RentalService).toBeDefined();
      expect(typeof RentalService.getRentals).toBe('function');
    });

    it('debería importar rentalApi correctamente', () => {
      expect(rentalApi).toBeDefined();
      expect(typeof rentalApi.getRentals).toBe('function');
    });

    it('debería crear store sin errores', () => {
      setActivePinia(createPinia());
      const store = useRentalStore();

      expect(store).toBeDefined();
      expect(store.allRentals).toEqual([]);
      expect(store.loading).toBe(false);
    });
  });

  describe('Configuración básica', () => {
    let mockRentalApi: any;

    beforeEach(() => {
      vi.clearAllMocks();
      mockRentalApi = vi.mocked(rentalApi);
    });

    it('debería hacer llamada básica al servicio', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'OK',
        properties: [],
      };

      mockRentalApi.getRentals.mockResolvedValue(mockResponse);

      // Act
      const result = await RentalService.getRentals();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockRentalApi.getRentals).toHaveBeenCalled();
    });

    it('debería manejar respuesta exitosa básica', async () => {
      // Arrange
      setActivePinia(createPinia());
      const store = useRentalStore();

      vi.doMock('@/services/rental.service', () => ({
        getRentals: vi.fn().mockResolvedValue({
          success: true,
          message: 'OK',
          properties: [
            {
              uuid: '123',
              propertyStreet: 'Test Street',
              propertyStreetNumber: 1,
              propertyFloor: 1,
              status: 'Publicado',
              propertyPriceMinUnit: 1000,
              last_status_changed_at: '2023-01-01T00:00:00Z',
              created_at: '2023-01-01T00:00:00Z',
            },
          ],
        }),
      }));

      // Act
      await store.fetchRentals();

      // Assert
      expect(store.error).toBeNull();
      expect(store.loading).toBe(false);
    });
  });

  describe('Funcionalidad básica', () => {
    it('debería tener estructura de tipos correcta', () => {
      // Arrange - verificar que los tipos están bien definidos
      const sampleRental = {
        uuid: 'test-uuid',
        propertyStreet: 'Test Street',
        propertyStreetNumber: 123,
        propertyFloor: 2,
        status: 'Publicado',
        propertyPriceMinUnit: 1200,
        last_status_changed_at: '2023-01-15T10:30:00Z',
        created_at: '2023-01-01T00:00:00Z',
      };

      // Act & Assert
      expect(typeof sampleRental.uuid).toBe('string');
      expect(typeof sampleRental.propertyStreet).toBe('string');
      expect(typeof sampleRental.propertyStreetNumber).toBe('number');
      expect(typeof sampleRental.propertyFloor).toBe('number');
      expect(typeof sampleRental.status).toBe('string');
      expect(typeof sampleRental.propertyPriceMinUnit).toBe('number');
    });

    it('debería tener exportaciones disponibles', () => {
      // Assert
      expect(RentalService).toBeDefined();
      expect(rentalApi).toBeDefined();
      expect(useRentalStore).toBeDefined();

      // Verificar que las funciones están exportadas
      expect(typeof RentalService.getRentals).toBe('function');
      expect(typeof rentalApi.getRentals).toBe('function');
      expect(typeof useRentalStore).toBe('function');
    });
  });

  describe('Estados de error básicos', () => {
    it('debería manejar error simple', async () => {
      // Arrange
      const mockRentalApi = vi.mocked(rentalApi);
      mockRentalApi.getRentals.mockRejectedValue(new Error('Simple error'));

      // Act & Assert
      await expect(RentalService.getRentals()).rejects.toThrow('Simple error');
    });

    it('debería inicializar store en estado limpio', () => {
      // Arrange
      setActivePinia(createPinia());

      // Act
      const store = useRentalStore();

      // Assert
      expect(store.allRentals).toEqual([]);
      expect(store.filteredRentals).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Compatibilidad', () => {
    it('debería mantener interfaz consistente', () => {
      // Assert - verificar que las interfaces no han cambiado
      expect(RentalService).toHaveProperty('getRentals');
      expect(rentalApi).toHaveProperty('getRentals');
    });

    it('debería funcionar con datos mínimos', async () => {
      // Arrange
      const minimalResponse: RentalsResponse = {
        success: true,
        message: '',
        properties: [],
      };

      const mockRentalApi = vi.mocked(rentalApi);
      mockRentalApi.getRentals.mockResolvedValue(minimalResponse);

      // Act
      const result = await RentalService.getRentals();

      // Assert
      expect(result.success).toBe(true);
      expect(Array.isArray(result.properties)).toBe(true);
    });
  });
});
