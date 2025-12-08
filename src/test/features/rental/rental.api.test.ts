import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rentalApi } from '@/api/modules/rental.api';
import http from '@/api/httpClient';
import type { RentalsResponse } from '@/types/Property';

// Mock del httpClient
vi.mock('@/api/httpClient');

describe('Rental API', () => {
  let mockHttp: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHttp = vi.mocked(http);
  });

  describe('getRentals - flujo principal', () => {
    it('debería obtener alquileres sin filtros', async () => {
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

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await rentalApi.getRentals();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals');
    });

    it('debería manejar respuesta exitosa vacía', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'No hay alquileres disponibles',
        properties: []
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await rentalApi.getRentals();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.properties).toHaveLength(0);
    });

    it('debería manejar errores de HTTP', async () => {
      // Arrange
      const httpError = new Error('Error de conexión');
      mockHttp.get.mockRejectedValue(httpError);

      // Act & Assert
      await expect(rentalApi.getRentals()).rejects.toThrow('Error de conexión');
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals');
    });

    it('debería usar filtros básicos en URL', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'Alquileres filtrados',
        properties: []
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act - test básico con filtro para coverage
      await rentalApi.getRentals({ status: 'Publicado' });

      // Assert
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals?status=Publicado');
    });

    it('debería manejar filtros undefined/null/vacíos', async () => {
      // Arrange
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'Alquileres sin filtros',
        properties: []
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act - test para coverage de validación de filtros
      await rentalApi.getRentals({ status: undefined, propertyStreet: '' });

      // Assert - debe ignorar filtros vacíos y usar URL base
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals');
    });

    it('debería construir URL con múltiples filtros válidos', async () => {
      // Arrange  
      const mockResponse: RentalsResponse = {
        success: true,
        message: 'Alquileres con filtros',
        properties: []
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act - test para coverage de múltiples filtros
      await rentalApi.getRentals({ 
        status: 'Publicado', 
        minPrice: 500,
        maxPrice: 1500 
      });

      // Assert - debe construir URL con todos los filtros
      expect(mockHttp.get).toHaveBeenCalledWith('/rentals?status=Publicado&minPrice=500&maxPrice=1500');
    });
  });
});