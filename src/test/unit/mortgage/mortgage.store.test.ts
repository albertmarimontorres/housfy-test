import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useMortgageStore } from '@/stores/mortgage.store';
import { mortgageApi } from '@/api/modules/mortgage.api';
import type { Mortgage, MortgagesResponse } from '@/types/Mortgage';

// Mock del API
vi.mock('@/api/modules/mortgage.api');

describe('Mortgage Store', () => {
  let mortgageStore: any;
  let mockMortgageApi: any;

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
      created_at: '2023-01-01T00:00:00Z'
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
      created_at: '2023-01-02T00:00:00Z'
    },
    {
      uuid: '789',
      bank: 'CaixaBank',
      city: 'Valencia',
      loanAmountMinUnit: 30000000, // 300,000 EUR
      propertyValueMinUnit: 40000000, // 400,000 EUR
      ltv: 75,
      status: 'Rechazado',
      last_status_changed_at: '2023-01-12T14:00:00Z',
      created_at: '2023-01-03T00:00:00Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    mortgageStore = useMortgageStore();
    mockMortgageApi = vi.mocked(mortgageApi);
  });

  describe('Estado inicial', () => {
    it('debería tener estado inicial correcto', () => {
      expect(mortgageStore.mortgages).toEqual([]);
      expect(mortgageStore.loading).toBe(false);
      expect(mortgageStore.error).toBeNull();
      expect(mortgageStore.filters).toEqual({});
    });
  });

  describe('fetchMortgages', () => {
    it('debería cargar hipotecas exitosamente', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: true,
        message: 'OK',
        mortgages: mockMortgages
      };
      mockMortgageApi.getMortgages.mockResolvedValue(mockResponse);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.loading).toBe(false);
      expect(mortgageStore.error).toBeNull();
      expect(mortgageStore.mortgages).toEqual(mockMortgages);
    });

    it('debería manejar respuesta sin success', async () => {
      // Arrange
      const mockResponse: MortgagesResponse = {
        success: false,
        message: 'Error del servidor',
        mortgages: []
      };
      mockMortgageApi.getMortgages.mockResolvedValue(mockResponse);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.error).toBe('Error al obtener las hipotecas');
      expect(mortgageStore.mortgages).toEqual([]);
    });

    it('debería manejar errores de red', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockMortgageApi.getMortgages.mockRejectedValue(networkError);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.error).toBe('Network Error');
      expect(mortgageStore.mortgages).toEqual([]);
      expect(mortgageStore.loading).toBe(false);
    });

    it('debería manejar respuesta sin mortgages', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'OK',
        mortgages: null as any
      };
      mockMortgageApi.getMortgages.mockResolvedValue(mockResponse);

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.mortgages).toEqual([]);
    });

    it('debería manejar errores no-Error objects', async () => {
      // Arrange
      mockMortgageApi.getMortgages.mockRejectedValue('String error');

      // Act
      await mortgageStore.fetchMortgages();

      // Assert
      expect(mortgageStore.error).toBe('Error desconocido');
    });

    it('debería manejar loading state correctamente', async () => {
      // Arrange
      let resolvePromise: any;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockMortgageApi.getMortgages.mockReturnValue(promise);

      // Act
      const fetchPromise = mortgageStore.fetchMortgages();
      
      // Assert - durante la carga
      expect(mortgageStore.loading).toBe(true);

      // Completar la promesa
      resolvePromise({
        success: true,
        message: 'OK',
        mortgages: []
      });
      await fetchPromise;

      // Assert - después de la carga
      expect(mortgageStore.loading).toBe(false);
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      mortgageStore.mortgages = mockMortgages;
    });

    it('debería calcular isEmpty correctamente', () => {
      // Con datos
      expect(mortgageStore.isEmpty).toBe(false);
      
      // Sin datos
      mortgageStore.mortgages = [];
      expect(mortgageStore.isEmpty).toBe(true);
    });

    it('debería calcular mortgagesCount correctamente', () => {
      expect(mortgageStore.mortgagesCount).toBe(3);
      
      mortgageStore.mortgages = [];
      expect(mortgageStore.mortgagesCount).toBe(0);
    });

    it('debería calcular hasMortgages correctamente', () => {
      expect(mortgageStore.hasMortgages).toBe(true);
      
      mortgageStore.mortgages = [];
      expect(mortgageStore.hasMortgages).toBe(false);
    });

    it('debería detectar hasFiltersApplied correctamente', () => {
      // Inicializar filtros primero
      mortgageStore.clearFilters(); // Esto inicializa las propiedades
      
      // Sin filtros - el getter puede devolver '' o false
      expect(mortgageStore.hasFiltersApplied).toBeFalsy();
      
      // Con filtro de status
      mortgageStore.filters = { status: 'Aprobado' };
      expect(mortgageStore.hasFiltersApplied).toBeTruthy();
      
      // Con filtro de ciudad
      mortgageStore.filters = { city: 'Madrid' };
      expect(mortgageStore.hasFiltersApplied).toBeTruthy();
      
      // Con filtro de banco
      mortgageStore.filters = { bank: 'BBVA' };
      expect(mortgageStore.hasFiltersApplied).toBeTruthy();
      
      // Con filtros de precio
      mortgageStore.filters = { minLoanAmount: 100000 };
      expect(mortgageStore.hasFiltersApplied).toBeTruthy();
    });

    describe('filteredMortgages', () => {
      it('debería retornar todas las hipotecas sin filtros', () => {
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toEqual(mockMortgages);
      });

      it('debería filtrar por status', () => {
        // Arrange
        mortgageStore.filters = { status: 'Aprobado' };
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(1);
        expect(filtered[0]!.status).toBe('Aprobado');
      });

      it('debería filtrar por importe mínimo del préstamo', () => {
        // Arrange
        mortgageStore.filters = { minLoanAmount: 200000 }; // 200,000 EUR
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(2);
        expect(filtered.every((m: Mortgage) => m.loanAmountMinUnit >= 20000000)).toBe(true);
      });

      it('debería filtrar por importe máximo del préstamo', () => {
        // Arrange
        mortgageStore.filters = { maxLoanAmount: 200000 }; // 200,000 EUR
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(2);
        expect(filtered.every((m: Mortgage) => m.loanAmountMinUnit <= 20000000)).toBe(true);
      });

      it('debería filtrar por valor mínimo de propiedad', () => {
        // Arrange
        mortgageStore.filters = { minPropertyValue: 300000 }; // 300,000 EUR
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(1);
        expect(filtered[0]!.uuid).toBe('789');
      });

      it('debería filtrar por valor máximo de propiedad', () => {
        // Arrange
        mortgageStore.filters = { maxPropertyValue: 250000 }; // 250,000 EUR
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(2);
        expect(filtered.every((m: Mortgage) => m.propertyValueMinUnit <= 25000000)).toBe(true);
      });

      it('debería filtrar por ciudad (case insensitive)', () => {
        // Arrange
        mortgageStore.filters = { city: 'madrid' }; // lowercase
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(1);
        expect(filtered[0]!.city).toBe('Madrid');
      });

      it('debería filtrar por banco (case insensitive)', () => {
        // Arrange
        mortgageStore.filters = { bank: 'bbva' }; // lowercase
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(1);
        expect(filtered[0]!.bank).toBe('BBVA');
      });

      it('debería aplicar múltiples filtros combinados', () => {
        // Arrange
        mortgageStore.filters = {
          status: 'Aprobado',
          city: 'madrid',
          minLoanAmount: 150000
        };
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toHaveLength(1);
        expect(filtered[0]!.uuid).toBe('123');
      });

      it('debería retornar array vacío sin coincidencias', () => {
        // Arrange
        mortgageStore.filters = { status: 'No Existe' };
        
        // Act
        const filtered = mortgageStore.filteredMortgages;
        
        // Assert
        expect(filtered).toEqual([]);
      });
    });
  });

  describe('updateFilters', () => {
    it('debería actualizar filtros parcialmente', () => {
      // Arrange
      mortgageStore.filters = { status: 'Aprobado' };
      
      // Act
      mortgageStore.updateFilters({ city: 'Madrid' });
      
      // Assert
      expect(mortgageStore.filters).toEqual({
        status: 'Aprobado',
        city: 'Madrid'
      });
    });

    it('debería sobrescribir filtros existentes', () => {
      // Arrange
      mortgageStore.filters = { status: 'Pendiente' };
      
      // Act
      mortgageStore.updateFilters({ status: 'Aprobado' });
      
      // Assert
      expect(mortgageStore.filters.status).toBe('Aprobado');
    });

    it('debería manejar filtros vacíos', () => {
      // Act
      mortgageStore.updateFilters({});
      
      // Assert
      expect(mortgageStore.filters).toEqual({});
    });
  });

  describe('clearFilters', () => {
    it('debería limpiar todos los filtros', () => {
      // Arrange
      mortgageStore.filters = {
        status: 'Aprobado',
        city: 'Madrid',
        bank: 'BBVA',
        minLoanAmount: 100000
      };
      
      // Act
      mortgageStore.clearFilters();
      
      // Assert
      expect(mortgageStore.filters).toEqual({
        status: '',
        minLoanAmount: undefined,
        maxLoanAmount: undefined,
        minPropertyValue: undefined,
        maxPropertyValue: undefined,
        city: '',
        bank: '',
      });
    });
  });

  describe('getMortgageById', () => {
    beforeEach(() => {
      mortgageStore.mortgages = mockMortgages;
    });

    it('debería encontrar hipoteca por UUID', () => {
      // Act
      const mortgage = mortgageStore.getMortgageById('123');
      
      // Assert
      expect(mortgage).toBeDefined();
      expect(mortgage!.uuid).toBe('123');
      expect(mortgage!.bank).toBe('Banco Santander');
    });

    it('debería retornar undefined si no encuentra', () => {
      // Act
      const mortgage = mortgageStore.getMortgageById('no-existe');
      
      // Assert
      expect(mortgage).toBeUndefined();
    });

    it('debería manejar string vacío', () => {
      // Act
      const mortgage = mortgageStore.getMortgageById('');
      
      // Assert
      expect(mortgage).toBeUndefined();
    });
  });

  describe('$reset', () => {
    it('debería resetear todo el estado', () => {
      // Arrange
      mortgageStore.mortgages = mockMortgages;
      mortgageStore.loading = true;
      mortgageStore.error = 'Error test';
      mortgageStore.filters = { status: 'Aprobado' };
      
      // Act
      mortgageStore.$reset();
      
      // Assert
      expect(mortgageStore.mortgages).toEqual([]);
      expect(mortgageStore.loading).toBe(false);
      expect(mortgageStore.error).toBeNull();
      expect(mortgageStore.filters).toEqual({
        status: '',
        minLoanAmount: undefined,
        maxLoanAmount: undefined,
        minPropertyValue: undefined,
        maxPropertyValue: undefined,
        city: '',
        bank: '',
      });
    });
  });
});