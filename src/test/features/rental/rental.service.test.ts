import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RentalService, getRentals, formatMonthlyPrice, getRentalStatusLabel, getRentalStatusColor } from '@/services/rental.service';
import { rentalApi } from '@/api/modules/rental.api';
import { formatPropertyPrice, getStatusConfig } from '@/services/property.service';
import type { RentalsResponse } from '@/types/Property';

// Mock de la API
vi.mock('@/api/modules/rental.api');
// Mock del servicio base
vi.mock('@/services/property.service');

describe('Rental Service', () => {
  let mockRentalApi: any;
  let mockFormatPropertyPrice: any;
  let mockGetStatusConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRentalApi = vi.mocked(rentalApi);
    mockFormatPropertyPrice = vi.mocked(formatPropertyPrice);
    mockGetStatusConfig = vi.mocked(getStatusConfig);
    
    // Configurar mocks por defecto
    mockFormatPropertyPrice.mockReturnValue('€1.200/mes');
    mockGetStatusConfig.mockReturnValue({
      label: 'Disponible',
      color: 'green'
    });
  });

  describe('getRentals - flujo principal', () => {
    it('debería obtener alquileres exitosamente', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'Alquileres obtenidos correctamente',
        properties: [
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
        ]
      };

      mockRentalApi.getRentals.mockResolvedValue(mockResponse);

      // Act
      const result = await RentalService.getRentals();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockRentalApi.getRentals).toHaveBeenCalledWith(undefined);
    });

    it('debería manejar errores conocidos de API', async () => {
      // Arrange
      const apiError = new Error('Error de conexión');
      mockRentalApi.getRentals.mockRejectedValue(apiError);

      // Act & Assert
      await expect(RentalService.getRentals()).rejects.toThrow('Error de conexión');
      expect(mockRentalApi.getRentals).toHaveBeenCalled();
    });

    it('debería manejar errores desconocidos', async () => {
      // Arrange - error que no es instancia de Error
      const unknownError = 'string error';
      mockRentalApi.getRentals.mockRejectedValue(unknownError);

      // Act & Assert
      await expect(RentalService.getRentals()).rejects.toThrow('Error desconocido al obtener los alquileres');
    });

    it('debería usar función alias getRentals', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'OK',
        properties: []
      };

      mockRentalApi.getRentals.mockResolvedValue(mockResponse);

      // Act
      const result = await getRentals();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockRentalApi.getRentals).toHaveBeenCalled();
    });
  });

  describe('Helper functions', () => {
    describe('formatMonthlyPrice', () => {
      it('debería validar precio positivo', () => {
        // Act
        const result = formatMonthlyPrice(1200);
        
        // Assert
        expect(result).toBe('€1.200/mes');
        expect(mockFormatPropertyPrice).toHaveBeenCalledWith(1200, 'rental');
      });

      it('debería fallar con precio negativo', () => {
        // Act & Assert
        expect(() => formatMonthlyPrice(-100)).toThrow('El precio mensual debe ser un número positivo');
      });
    });

    describe('getRentalStatusLabel', () => {
      it('debería manejar status válido', () => {
        // Act
        const result = getRentalStatusLabel('Publicado');
        
        // Assert
        expect(result).toBe('Disponible');
        expect(mockGetStatusConfig).toHaveBeenCalledWith('Publicado', 'rental');
      });

      it('debería manejar status vacío', () => {
        // Act
        const result = getRentalStatusLabel('');
        
        // Assert
        expect(result).toBe('Estado desconocido');
      });
    });

    describe('getRentalStatusColor', () => {
      it('debería manejar status válido', () => {
        // Act
        const result = getRentalStatusColor('Publicado');
        
        // Assert
        expect(result).toBe('green');
        expect(mockGetStatusConfig).toHaveBeenCalledWith('Publicado', 'rental');
      });

      it('debería manejar status vacío', () => {
        // Act
        const result = getRentalStatusColor('');
        
        // Assert
        expect(result).toBe('grey');
      });
    });
  });
});