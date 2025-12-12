import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMortgageStore } from '@/stores/mortgage.store';
import { mortgageService } from '@/services/mortgage.service';
import { mortgageApi } from '@/api/modules/mortgage.api';
import httpClient from '@/api/httpClient';
import type { Mortgage, MortgagesResponse } from '@/types/Mortgage';

// Mocks
vi.mock('@/api/httpClient');
vi.mock('@/services/property.service', () => ({
  formatPrice: vi.fn((amount: number) => `€${amount.toLocaleString('es-ES')}`),
  formatDate: vi.fn((dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES')),
}));

describe('Mortgage - Integración E2E', () => {
  let mortgageStore: any;
  let mockHttp: any;

  const mockMortgages: Mortgage[] = [
    {
      uuid: '123',
      bank: 'Banco Santander',
      city: 'Madrid',
      loanAmountMinUnit: 20000000, // 200,000 EUR
      propertyValueMinUnit: 25000000, // 250,000 EUR
      ltv: 80,
      status: 'Aprobado',
      last_status_changed_at: '2023-01-15T10:30:00Z',
      created_at: '2023-01-01T00:00:00Z',
    },
    {
      uuid: '456',
      bank: 'BBVA',
      city: 'Barcelona',
      loanAmountMinUnit: 15000000, // 150,000 EUR
      propertyValueMinUnit: 20000000, // 200,000 EUR
      ltv: 75,
      status: 'Pendiente',
      last_status_changed_at: '2023-01-10T08:00:00Z',
      created_at: '2023-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    mortgageStore = useMortgageStore();
    mockHttp = vi.mocked(httpClient);
  });

  describe('Flujo completo: Store → Service → API → HTTP', () => {
    it('debería completar el flujo exitoso completo', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'Hipotecas obtenidas correctamente',
        mortgages: mockMortgages,
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await mortgageStore.fetchMortgages();

      // Assert - Verificar toda la cadena
      expect(mockHttp.get).toHaveBeenCalledWith('/mortgages');
      expect(mortgageStore.mortgages).toEqual(mockMortgages);
      expect(mortgageStore.error).toBeNull();
    });

    it('debería propagar errores desde HTTP hasta Store', async () => {
      // Arrange
      const httpError = new Error('Error de conexión');
      mockHttp.get.mockRejectedValue(httpError);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.error).toBe('Error de conexión');
      expect(mortgageStore.mortgages).toEqual([]);
    });
  });

  describe('Integración Service ↔ API', () => {
    it('debería usar API correctamente desde Service', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'Test response',
        mortgages: [],
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      const result = await mortgageApi.getMortgages();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockHttp.get).toHaveBeenCalledWith('/mortgages');
    });

    it('debería formatear datos correctamente en Service', () => {
      // Arrange
      const testMortgage = mockMortgages[0]!;

      // Act
      const formattedLoan = mortgageService.formatLoanAmount(testMortgage);
      const formattedProperty = mortgageService.formatPropertyValue(testMortgage);
      const formattedLTV = mortgageService.formatLTV(testMortgage);

      // Assert
      expect(formattedLoan).toBe('€200.000');
      expect(formattedProperty).toBe('€250.000');
      expect(formattedLTV).toBe('80%');
    });
  });

  describe('Flujo de filtrado integrado', () => {
    beforeEach(async () => {
      // Configurar datos de prueba
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'OK',
        mortgages: mockMortgages,
      };
      mockHttp.get.mockResolvedValue({ data: mockResponse });
      await mortgageStore.fetchMortgages();
    });

    it('debería filtrar por status y reflejar en getters', () => {
      // Act
      mortgageStore.updateFilters({ status: 'Aprobado' });

      // Assert
      const filtered = mortgageStore.filteredMortgages;
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.status).toBe('Aprobado');
      expect(mortgageStore.hasFiltersApplied).toBe(true);
    });

    it('debería combinar filtros múltiples', () => {
      // Act
      mortgageStore.updateFilters({
        status: 'Pendiente',
        city: 'Barcelona',
      });

      // Assert
      const filtered = mortgageStore.filteredMortgages;
      expect(filtered).toHaveLength(1);
      expect(filtered[0]!.uuid).toBe('456');
    });

    it('debería limpiar filtros y mostrar todos', () => {
      // Arrange
      mortgageStore.updateFilters({ status: 'Aprobado' });
      expect(mortgageStore.filteredMortgages).toHaveLength(1);

      // Act
      mortgageStore.clearFilters();

      // Assert
      expect(mortgageStore.filteredMortgages).toHaveLength(2);
      expect(mortgageStore.hasFiltersApplied).toBeFalsy();
    });
  });

  describe('Casos de error integrados', () => {
    it('debería manejar respuesta malformada', async () => {
      // Arrange
      const malformedResponse = {
        data: {
          success: true,
          message: 'OK',
          mortgages: 'not an array', // Tipo incorrecto
        },
      };

      mockHttp.get.mockResolvedValue(malformedResponse);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.mortgages).toBe('not an array'); // Store asigna lo que recibe
    });

    it('debería manejar timeout de red', async () => {
      // Arrange
      const timeoutError = new Error('Network timeout');
      mockHttp.get.mockRejectedValue(timeoutError);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.error).toBe('Network timeout');
      expect(mortgageStore.loading).toBe(false);
    });

    it('debería manejar error 500 del servidor', async () => {
      // Arrange
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      };
      mockHttp.get.mockRejectedValue(serverError);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.error).toBe('Error desconocido'); // Store maneja errores no-Error
      expect(mortgageStore.mortgages).toEqual([]);
    });
  });

  describe('Flujos de datos complejos', () => {
    it('debería manejar múltiples hipotecas correctamente', async () => {
      // Arrange
      const multipleRentals: Mortgage[] = [
        {
          uuid: '123',
          bank: 'Banco Santander',
          city: 'Madrid',
          loanAmountMinUnit: 20000000,
          propertyValueMinUnit: 25000000,
          ltv: 80,
          status: 'Aprobado',
          last_status_changed_at: '2023-01-15T10:30:00Z',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          uuid: '456',
          bank: 'BBVA',
          city: 'Barcelona',
          loanAmountMinUnit: 15000000,
          propertyValueMinUnit: 20000000,
          ltv: 75,
          status: 'Pendiente',
          last_status_changed_at: '2023-01-10T08:00:00Z',
          created_at: '2023-01-02T00:00:00Z',
        },
        {
          uuid: '789',
          bank: 'CaixaBank',
          city: 'Valencia',
          loanAmountMinUnit: 30000000,
          propertyValueMinUnit: 40000000,
          ltv: 75,
          status: 'Rechazado',
          last_status_changed_at: '2023-01-12T14:00:00Z',
          created_at: '2023-01-03T00:00:00Z',
        },
      ];

      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'Múltiples hipotecas',
        mortgages: multipleRentals,
      };

      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.mortgages).toHaveLength(3);
      expect(mortgageStore.mortgagesCount).toBe(3);
      expect(mortgageStore.hasMortgages).toBe(true);
      expect(mortgageStore.isEmpty).toBe(false);

      // Verificar cada hipoteca
      const mortgage1 = mortgageStore.getMortgageById('123');
      const mortgage2 = mortgageStore.getMortgageById('456');
      const mortgage3 = mortgageStore.getMortgageById('789');

      expect(mortgage1!.bank).toBe('Banco Santander');
      expect(mortgage2!.bank).toBe('BBVA');
      expect(mortgage3!.bank).toBe('CaixaBank');
    });

    it('debería reset completo después de error y recargar', async () => {
      // Arrange - Primero un error
      mockHttp.get.mockRejectedValue(new Error('Error inicial'));
      await mortgageStore.fetchMortgages();

      expect(mortgageStore.error).toBeTruthy();

      // Act - Reset y recarga exitosa
      mortgageStore.$reset();

      const successResponse: MortgagesResponse = {
        success: true,
        message: 'OK',
        mortgages: [mockMortgages[0]!],
      };
      mockHttp.get.mockResolvedValue({ data: successResponse });

      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.error).toBeNull();
      expect(mortgageStore.mortgages).toHaveLength(1);
      expect(mortgageStore.mortgages[0]!.uuid).toBe('123');
    });

    it('debería mantener consistencia entre getters y estado', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'OK',
        mortgages: mockMortgages,
      };
      mockHttp.get.mockResolvedValue({ data: mockResponse });

      // Act
      await mortgageStore.fetchMortgages();

      // Assert - Verificar consistencia de getters
      expect(mortgageStore.mortgagesCount).toBe(mortgageStore.mortgages.length);
      expect(mortgageStore.hasMortgages).toBe(mortgageStore.mortgages.length > 0);
      expect(mortgageStore.isEmpty).toBe(mortgageStore.mortgages.length === 0);
      expect(mortgageStore.filteredMortgages.length).toBeLessThanOrEqual(
        mortgageStore.mortgages.length
      );
    });
  });

  describe('Integración Service con formateo completo', () => {
    it('debería formatear todos los campos de una hipoteca', () => {
      // Arrange
      const testMortgage = mockMortgages[0]!;

      // Act - Probar todos los métodos de formateo
      const results = {
        config: mortgageService.getConfig(),
        loanAmount: mortgageService.formatLoanAmount(testMortgage),
        propertyValue: mortgageService.formatPropertyValue(testMortgage),
        ltv: mortgageService.formatLTV(testMortgage),
        statusColor: mortgageService.getStatusColor(testMortgage.status),
        statusLabel: mortgageService.getStatusLabel(testMortgage.status),
        location: mortgageService.formatLocation(testMortgage),
        description: mortgageService.generateDescription(testMortgage),
        lastChanged: mortgageService.formatLastStatusChanged(testMortgage),
        createdAt: mortgageService.formatCreatedAt(testMortgage),
      };

      // Assert
      expect(results.config).toBeDefined();
      expect(results.loanAmount).toBe('€200.000');
      expect(results.propertyValue).toBe('€250.000');
      expect(results.ltv).toBe('80%');
      expect(results.statusColor).toBe('success');
      expect(results.statusLabel).toBe('Aprobado');
      expect(results.location).toBe('Madrid');
      expect(results.description).toContain('Banco Santander');
      expect(results.description).toContain('LTV: 80%');
      expect(results.lastChanged).toBe('15/1/2023');
      expect(results.createdAt).toBe('1/1/2023');
    });
  });
});
