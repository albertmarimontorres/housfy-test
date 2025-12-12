import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mortgageApi } from '@/api/modules/mortgage.api';
import httpClient from '@/api/httpClient';
import type { MortgagesResponse } from '@/types/Mortgage';

// Mock del httpClient
vi.mock('@/api/httpClient');

describe('Mortgage API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMortgages', () => {
    it('debería obtener hipotecas exitosamente', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'Hipotecas obtenidas correctamente',
        mortgages: [
          {
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            bank: 'Banco Santander',
            city: 'Madrid',
            loanAmountMinUnit: 20000000, // 200,000 EUR en centavos
            propertyValueMinUnit: 25000000, // 250,000 EUR en centavos
            ltv: 80,
            status: 'Aprobado',
            last_status_changed_at: '2023-01-15T10:30:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      vi.mocked(httpClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await mortgageApi.getMortgages();

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith('/mortgages');
      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
      expect(result.mortgages).toHaveLength(1);
      expect(result.mortgages[0]!.bank).toBe('Banco Santander');
    });

    it('debería manejar respuesta vacía', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'No hay hipotecas disponibles',
        mortgages: [],
      };

      vi.mocked(httpClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await mortgageApi.getMortgages();

      // Assert
      expect(result.success).toBe(true);
      expect(result.mortgages).toEqual([]);
      expect(result.message).toBe('No hay hipotecas disponibles');
    });

    it('debería manejar errores de red', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      vi.mocked(httpClient.get).mockRejectedValue(networkError);

      // Act & Assert
      await expect(mortgageApi.getMortgages()).rejects.toThrow('Network Error');
      expect(httpClient.get).toHaveBeenCalledWith('/mortgages');
    });

    it('debería manejar respuesta de error del servidor', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Error interno del servidor',
            mortgages: [],
          },
        },
      };

      vi.mocked(httpClient.get).mockRejectedValue(errorResponse);

      // Act & Assert
      await expect(mortgageApi.getMortgages()).rejects.toEqual(errorResponse);
    });

    it('debería usar la URL correcta', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'OK',
        mortgages: [],
      };

      vi.mocked(httpClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      await mortgageApi.getMortgages();

      // Assert
      expect(httpClient.get).toHaveBeenCalledTimes(1);
      expect(httpClient.get).toHaveBeenCalledWith('/mortgages');
    });

    it('debería manejar múltiples hipotecas', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'Múltiples hipotecas',
        mortgages: [
          {
            uuid: '123',
            bank: 'BBVA',
            city: 'Barcelona',
            loanAmountMinUnit: 15000000,
            propertyValueMinUnit: 20000000,
            ltv: 75,
            status: 'Pendiente',
            last_status_changed_at: '2023-01-10T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
          {
            uuid: '456',
            bank: 'CaixaBank',
            city: 'Valencia',
            loanAmountMinUnit: 30000000,
            propertyValueMinUnit: 40000000,
            ltv: 75,
            status: 'Aprobado',
            last_status_changed_at: '2023-01-12T00:00:00Z',
            created_at: '2023-01-02T00:00:00Z',
          },
        ],
      };

      vi.mocked(httpClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await mortgageApi.getMortgages();

      // Assert
      expect(result.mortgages).toHaveLength(2);
      expect(result.mortgages[0]!.bank).toBe('BBVA');
      expect(result.mortgages[1]!.bank).toBe('CaixaBank');
    });

    it('debería preservar todos los campos de la hipoteca', async () => {
      // Arrange
      const mortgage = {
        uuid: 'test-uuid',
        bank: 'Test Bank',
        city: 'Test City',
        loanAmountMinUnit: 10000000,
        propertyValueMinUnit: 12500000,
        ltv: 80,
        status: 'Test Status',
        last_status_changed_at: '2023-01-15T10:30:00Z',
        created_at: '2023-01-01T00:00:00Z',
      };

      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'Test',
        mortgages: [mortgage],
      };

      vi.mocked(httpClient.get).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await mortgageApi.getMortgages();

      // Assert
      const returnedMortgage = result.mortgages[0]!;
      expect(returnedMortgage.uuid).toBe(mortgage.uuid);
      expect(returnedMortgage.bank).toBe(mortgage.bank);
      expect(returnedMortgage.city).toBe(mortgage.city);
      expect(returnedMortgage.loanAmountMinUnit).toBe(mortgage.loanAmountMinUnit);
      expect(returnedMortgage.propertyValueMinUnit).toBe(mortgage.propertyValueMinUnit);
      expect(returnedMortgage.ltv).toBe(mortgage.ltv);
      expect(returnedMortgage.status).toBe(mortgage.status);
      expect(returnedMortgage.last_status_changed_at).toBe(mortgage.last_status_changed_at);
      expect(returnedMortgage.created_at).toBe(mortgage.created_at);
    });
  });
});
