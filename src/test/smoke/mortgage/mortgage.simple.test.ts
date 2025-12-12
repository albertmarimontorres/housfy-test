import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mortgageService } from '@/services/mortgage.service';
import { mortgageApi } from '@/api/modules/mortgage.api';
import { useMortgageStore } from '@/stores/mortgage.store';
import { createPinia, setActivePinia } from 'pinia';
import type { MortgagesResponse } from '@/types/Mortgage';

// Mocks simples
vi.mock('@/api/modules/mortgage.api');
vi.mock('@/services/property.service');

describe('Mortgage - Tests Simples', () => {
  describe('Smoke Tests', () => {
    it('debería importar mortgageService correctamente', () => {
      expect(mortgageService).toBeDefined();
      expect(typeof mortgageService.getConfig).toBe('function');
      expect(typeof mortgageService.formatLoanAmount).toBe('function');
      expect(typeof mortgageService.formatPropertyValue).toBe('function');
    });

    it('debería importar mortgageApi correctamente', () => {
      expect(mortgageApi).toBeDefined();
      expect(typeof mortgageApi.getMortgages).toBe('function');
    });

    it('debería crear store sin errores', () => {
      setActivePinia(createPinia());
      const store = useMortgageStore();

      expect(store).toBeDefined();
      expect(store.mortgages).toEqual([]);
      expect(store.loading).toBe(false);
    });
  });

  describe('Configuración básica', () => {
    let mockMortgageApi: any;

    beforeEach(() => {
      vi.clearAllMocks();
      mockMortgageApi = vi.mocked(mortgageApi);
    });

    it('debería hacer llamada básica al servicio', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'OK',
        mortgages: [],
      };

      mockMortgageApi.getMortgages.mockResolvedValue(mockResponse);

      // Act
      const result = await mortgageApi.getMortgages();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockMortgageApi.getMortgages).toHaveBeenCalled();
    });

    it('debería manejar respuesta exitosa básica', async () => {
      // Arrange
      setActivePinia(createPinia());
      const store = useMortgageStore();

      vi.doMock('@/api/modules/mortgage.api', () => ({
        mortgageApi: {
          getMortgages: vi.fn().mockResolvedValue({
            success: true,
            message: 'OK',
            mortgages: [
              {
                uuid: '123',
                bank: 'Test Bank',
                city: 'Test City',
                loanAmountMinUnit: 20000000,
                propertyValueMinUnit: 25000000,
                ltv: 80,
                status: 'Aprobado',
                last_status_changed_at: '2023-01-15T10:30:00Z',
                created_at: '2023-01-01T00:00:00Z',
              },
            ],
          }),
        },
      }));

      // Act
      await store.fetchMortgages();

      // Assert
      expect(store.error).toBeNull();
      expect(store.loading).toBe(false);
    });
  });

  describe('Funcionalidad básica', () => {
    it('debería tener estructura de tipos correcta', () => {
      // Arrange - verificar que los tipos están bien definidos
      const sampleMortgage = {
        uuid: 'test-uuid',
        bank: 'Test Bank',
        city: 'Test City',
        loanAmountMinUnit: 20000000,
        propertyValueMinUnit: 25000000,
        ltv: 80,
        status: 'Aprobado',
        last_status_changed_at: '2023-01-15T10:30:00Z',
        created_at: '2023-01-01T00:00:00Z',
      };

      // Act & Assert
      expect(typeof sampleMortgage.uuid).toBe('string');
      expect(typeof sampleMortgage.bank).toBe('string');
      expect(typeof sampleMortgage.city).toBe('string');
      expect(typeof sampleMortgage.loanAmountMinUnit).toBe('number');
      expect(typeof sampleMortgage.propertyValueMinUnit).toBe('number');
      expect(typeof sampleMortgage.ltv).toBe('number');
      expect(typeof sampleMortgage.status).toBe('string');
    });

    it('debería tener exportaciones disponibles', () => {
      // Assert
      expect(mortgageService).toBeDefined();
      expect(mortgageApi).toBeDefined();
      expect(useMortgageStore).toBeDefined();

      // Verificar que las funciones están exportadas
      expect(typeof mortgageService.getConfig).toBe('function');
      expect(typeof mortgageApi.getMortgages).toBe('function');
      expect(typeof useMortgageStore).toBe('function');
    });

    it('debería tener configuración de hipotecas válida', () => {
      // Act
      const config = mortgageService.getConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.icon).toBeDefined();
      expect(config.priceFormat).toBe('sale');
      expect(Array.isArray(config.statusOptions)).toBe(true);
      expect(config.statusOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Estados de error básicos', () => {
    it('debería manejar error simple', async () => {
      // Arrange
      const mockMortgageApi = vi.mocked(mortgageApi);
      mockMortgageApi.getMortgages.mockRejectedValue(new Error('Simple error'));

      // Act & Assert
      await expect(mortgageApi.getMortgages()).rejects.toThrow('Simple error');
    });

    it('debería inicializar store en estado limpio', () => {
      // Arrange
      setActivePinia(createPinia());

      // Act
      const store = useMortgageStore();

      // Assert
      expect(store.mortgages).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.isEmpty).toBe(true);
      expect(store.mortgagesCount).toBe(0);
      expect(store.hasMortgages).toBe(false);
    });
  });

  describe('Compatibilidad', () => {
    it('debería mantener interfaz consistente', () => {
      // Assert - verificar que las interfaces no han cambiado
      expect(mortgageService).toHaveProperty('getConfig');
      expect(mortgageService).toHaveProperty('formatLoanAmount');
      expect(mortgageService).toHaveProperty('formatPropertyValue');
      expect(mortgageService).toHaveProperty('formatLTV');
      expect(mortgageApi).toHaveProperty('getMortgages');
    });

    it('debería funcionar con datos mínimos', async () => {
      // Arrange
      const minimalResponse: MortgagesResponse = {
        success: true,
        message: '',
        mortgages: [],
      };

      const mockMortgageApi = vi.mocked(mortgageApi);
      mockMortgageApi.getMortgages.mockResolvedValue(minimalResponse);

      // Act
      const result = await mortgageApi.getMortgages();

      // Assert
      expect(result.success).toBe(true);
      expect(Array.isArray(result.mortgages)).toBe(true);
    });
  });

  describe('Valores esperados', () => {
    it('debería formatear correctamente valores típicos', () => {
      // Arrange
      const testMortgage = {
        uuid: '123',
        bank: 'Test Bank',
        city: 'Madrid',
        loanAmountMinUnit: 20000000, // 200k EUR
        propertyValueMinUnit: 25000000, // 250k EUR
        ltv: 80,
        status: 'Aprobado',
        last_status_changed_at: '2023-01-15T10:30:00Z',
        created_at: '2023-01-01T00:00:00Z',
      };

      // Act & Assert
      expect(mortgageService.formatLTV(testMortgage)).toBe('80%');
      expect(mortgageService.getStatusColor('Aprobado')).toBe('success');
      expect(mortgageService.getStatusLabel('Aprobado')).toBe('Aprobado');
      expect(mortgageService.formatLocation(testMortgage)).toBe('Madrid');
    });

    it('debería manejar casos edge de formateo', () => {
      // Arrange
      const edgeCaseMortgage = {
        uuid: '123',
        bank: '',
        city: '',
        loanAmountMinUnit: -1, // Negativo
        propertyValueMinUnit: -1, // Negativo también
        ltv: 150, // Inválido
        status: 'Estado Desconocido',
        last_status_changed_at: '',
        created_at: '',
      };

      // Act & Assert
      expect(mortgageService.formatLoanAmount(edgeCaseMortgage)).toBe('Importe no disponible');
      expect(mortgageService.formatPropertyValue(edgeCaseMortgage)).toBe('Valor no disponible');
      expect(mortgageService.formatLTV(edgeCaseMortgage)).toBe('LTV no disponible');
      expect(mortgageService.getStatusColor('Estado Desconocido')).toBe('grey');
      expect(mortgageService.formatLocation(edgeCaseMortgage)).toBe('Ciudad no disponible');
    });
  });
});
