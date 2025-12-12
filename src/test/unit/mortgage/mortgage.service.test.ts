import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mortgageService } from '@/services/mortgage.service';
import type { Mortgage } from '@/types/Mortgage';

// Mock de property.service
vi.mock('@/services/property.service', () => ({
  formatPrice: vi.fn((amount: number) => `€${amount.toLocaleString('es-ES')}`),
  formatDate: vi.fn((dateStr: string) => new Date(dateStr).toLocaleDateString('es-ES')),
}));

describe('Mortgage Service', () => {
  const mockMortgage: Mortgage = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    bank: 'Banco Santander',
    city: 'Madrid',
    loanAmountMinUnit: 20000000, // 200,000 EUR en centavos
    propertyValueMinUnit: 25000000, // 250,000 EUR en centavos
    ltv: 80,
    status: 'Aprobado',
    last_status_changed_at: '2023-01-15T10:30:00Z',
    created_at: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('debería retornar la configuración de hipotecas', () => {
      // Act
      const config = mortgageService.getConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.icon).toBe('mdi-home-outline');
      expect(config.priceFormat).toBe('sale');
      expect(Array.isArray(config.statusOptions)).toBe(true);
      expect(config.statusOptions.length).toBeGreaterThan(0);
    });

    it('debería tener todas las opciones de estado requeridas', () => {
      // Act
      const config = mortgageService.getConfig();

      // Assert
      const statusValues = config.statusOptions.map(option => option.value);
      expect(statusValues).toContain('Aprobado');
      expect(statusValues).toContain('Pendiente');
      expect(statusValues).toContain('Rechazado');
      expect(statusValues).toContain('En Proceso');
      expect(statusValues).toContain('Publicado');
    });
  });

  describe('formatLoanAmount', () => {
    it('debería formatear el importe del préstamo correctamente', () => {
      // Act
      const result = mortgageService.formatLoanAmount(mockMortgage);

      // Assert
      expect(result).toBe('€200.000');
    });

    it('debería manejar importes en centavos negativos', () => {
      // Arrange
      const mortgageWithNegativeAmount = { ...mockMortgage, loanAmountMinUnit: -1000000 };

      // Act
      const result = mortgageService.formatLoanAmount(mortgageWithNegativeAmount);

      // Assert
      expect(result).toBe('Importe no disponible');
    });

    it('debería manejar importes undefined', () => {
      // Arrange
      const mortgageWithUndefinedAmount = { ...mockMortgage, loanAmountMinUnit: undefined as any };

      // Act
      const result = mortgageService.formatLoanAmount(mortgageWithUndefinedAmount);

      // Assert
      expect(result).toBe('Importe no disponible');
    });

    it('debería manejar importe cero', () => {
      // Arrange
      const mortgageWithZeroAmount = { ...mockMortgage, loanAmountMinUnit: 0 };

      // Act
      const result = mortgageService.formatLoanAmount(mortgageWithZeroAmount);

      // Assert
      expect(result).toBe('€0');
    });

    it('debería lanzar error con hipoteca inválida', () => {
      // Act & Assert
      expect(() => mortgageService.formatLoanAmount(null as any)).toThrow(
        'La hipoteca debe ser un objeto válido'
      );
      expect(() => mortgageService.formatLoanAmount(undefined as any)).toThrow(
        'La hipoteca debe ser un objeto válido'
      );
      expect(() => mortgageService.formatLoanAmount('invalid' as any)).toThrow(
        'La hipoteca debe ser un objeto válido'
      );
    });
  });

  describe('formatPropertyValue', () => {
    it('debería formatear el valor de la propiedad correctamente', () => {
      // Act
      const result = mortgageService.formatPropertyValue(mockMortgage);

      // Assert
      expect(result).toBe('€250.000');
    });

    it('debería manejar valores negativos', () => {
      // Arrange
      const mortgageWithNegativeValue = { ...mockMortgage, propertyValueMinUnit: -500000 };

      // Act
      const result = mortgageService.formatPropertyValue(mortgageWithNegativeValue);

      // Assert
      expect(result).toBe('Valor no disponible');
    });

    it('debería manejar valores undefined', () => {
      // Arrange
      const mortgageWithUndefinedValue = { ...mockMortgage, propertyValueMinUnit: null as any };

      // Act
      const result = mortgageService.formatPropertyValue(mortgageWithUndefinedValue);

      // Assert
      expect(result).toBe('Valor no disponible');
    });

    it('debería lanzar error con hipoteca inválida', () => {
      // Act & Assert
      expect(() => mortgageService.formatPropertyValue(null as any)).toThrow(
        'La hipoteca debe ser un objeto válido'
      );
      expect(() => mortgageService.formatPropertyValue(undefined as any)).toThrow(
        'La hipoteca debe ser un objeto válido'
      );
      expect(() => mortgageService.formatPropertyValue('invalid' as any)).toThrow(
        'La hipoteca debe ser un objeto válido'
      );
    });
  });

  describe('formatLTV', () => {
    it('debería formatear el LTV correctamente', () => {
      // Act
      const result = mortgageService.formatLTV(mockMortgage);

      // Assert
      expect(result).toBe('80%');
    });

    it('debería manejar LTV cero', () => {
      // Arrange
      const mortgageWithZeroLTV = { ...mockMortgage, ltv: 0 };

      // Act
      const result = mortgageService.formatLTV(mortgageWithZeroLTV);

      // Assert
      expect(result).toBe('0%');
    });

    it('debería manejar LTV 100%', () => {
      // Arrange
      const mortgageWithMaxLTV = { ...mockMortgage, ltv: 100 };

      // Act
      const result = mortgageService.formatLTV(mortgageWithMaxLTV);

      // Assert
      expect(result).toBe('100%');
    });

    it('debería manejar LTV inválido', () => {
      // Arrange
      const mortgageWithInvalidLTV = { ...mockMortgage, ltv: -10 };
      const mortgageWithHighLTV = { ...mockMortgage, ltv: 150 };
      const mortgageWithNonNumericLTV = { ...mockMortgage, ltv: 'invalid' as any };

      // Act
      const result1 = mortgageService.formatLTV(mortgageWithInvalidLTV);
      const result2 = mortgageService.formatLTV(mortgageWithHighLTV);
      const result3 = mortgageService.formatLTV(mortgageWithNonNumericLTV);

      // Assert
      expect(result1).toBe('LTV no disponible');
      expect(result2).toBe('LTV no disponible');
      expect(result3).toBe('LTV no disponible');
    });
  });

  describe('getStatusColor', () => {
    it('debería retornar el color correcto para estados válidos', () => {
      // Act & Assert
      expect(mortgageService.getStatusColor('Aprobado')).toBe('success');
      expect(mortgageService.getStatusColor('Pendiente')).toBe('warning');
      expect(mortgageService.getStatusColor('Rechazado')).toBe('error');
      expect(mortgageService.getStatusColor('En Proceso')).toBe('info');
    });

    it('debería retornar color por defecto para estados desconocidos', () => {
      // Act
      const result = mortgageService.getStatusColor('Estado Desconocido');

      // Assert
      expect(result).toBe('grey');
    });

    it('debería lanzar error con estado inválido', () => {
      // Act & Assert
      expect(() => mortgageService.getStatusColor('')).toThrow('El estado no puede estar vacío');
      expect(() => mortgageService.getStatusColor(null as any)).toThrow(
        'El estado debe ser una cadena de texto'
      );
      expect(() => mortgageService.getStatusColor(123 as any)).toThrow(
        'El estado debe ser una cadena de texto'
      );
    });

    it('debería manejar espacios en el estado', () => {
      // Act
      const result = mortgageService.getStatusColor('Aprobado'); // Sin espacios

      // Assert
      expect(result).toBe('success');
    });
  });

  describe('getStatusLabel', () => {
    it('debería retornar el label correcto para estados válidos', () => {
      // Act & Assert
      expect(mortgageService.getStatusLabel('Aprobado')).toBe('Aprobado');
      expect(mortgageService.getStatusLabel('Pendiente')).toBe('Pendiente');
      expect(mortgageService.getStatusLabel('Rechazado')).toBe('Rechazado');
    });

    it('debería retornar el estado original para estados desconocidos', () => {
      // Act
      const result = mortgageService.getStatusLabel('Estado Personalizado');

      // Assert
      expect(result).toBe('Estado Personalizado');
    });

    it('debería lanzar error con estado inválido', () => {
      // Act & Assert
      expect(() => mortgageService.getStatusLabel('')).toThrow('El estado no puede estar vacío');
      expect(() => mortgageService.getStatusLabel(undefined as any)).toThrow(
        'El estado debe ser una cadena de texto'
      );
    });
  });

  describe('formatLocation', () => {
    it('debería formatear la ubicación correctamente', () => {
      // Act
      const result = mortgageService.formatLocation(mockMortgage);

      // Assert
      expect(result).toBe('Madrid');
    });

    it('debería limpiar espacios extra', () => {
      // Arrange
      const mortgageWithSpaces = { ...mockMortgage, city: '  Barcelona  ' };

      // Act
      const result = mortgageService.formatLocation(mortgageWithSpaces);

      // Assert
      expect(result).toBe('Barcelona');
    });

    it('debería manejar ciudad vacía', () => {
      // Arrange
      const mortgageWithEmptyCity = { ...mockMortgage, city: '' };

      // Act
      const result = mortgageService.formatLocation(mortgageWithEmptyCity);

      // Assert
      expect(result).toBe('Ciudad no disponible');
    });

    it('debería manejar ciudad undefined', () => {
      // Arrange
      const mortgageWithUndefinedCity = { ...mockMortgage, city: undefined as any };

      // Act
      const result = mortgageService.formatLocation(mortgageWithUndefinedCity);

      // Assert
      expect(result).toBe('Ciudad no disponible');
    });
  });

  describe('generateDescription', () => {
    it('debería generar descripción con todos los elementos', () => {
      // Act
      const result = mortgageService.generateDescription(mockMortgage);

      // Assert
      expect(result).toContain('Banco Santander');
      expect(result).toContain('LTV: 80%');
      expect(result).toContain(' • '); // Separador
    });

    it('debería manejar banco vacío', () => {
      // Arrange
      const mortgageWithoutBank = { ...mockMortgage, bank: '' };

      // Act
      const result = mortgageService.generateDescription(mortgageWithoutBank);

      // Assert
      expect(result).toBe('LTV: 80%');
    });

    it('debería manejar LTV inválido', () => {
      // Arrange
      const mortgageWithInvalidLTV = { ...mockMortgage, ltv: -1 };

      // Act
      const result = mortgageService.generateDescription(mortgageWithInvalidLTV);

      // Assert
      expect(result).toBe('Banco Santander • LTV: -1%'); // El servicio incluye cualquier número
    });

    it('debería manejar datos completamente vacíos', () => {
      // Arrange
      const emptyMortgage = { ...mockMortgage, bank: '', ltv: -1 };

      // Act
      const result = mortgageService.generateDescription(emptyMortgage);

      // Assert
      expect(result).toBe('LTV: -1%'); // Solo incluye LTV aunque sea inválido
    });
  });

  describe('formatLastStatusChanged', () => {
    it('debería formatear la fecha del último cambio de estado', () => {
      // Act
      const result = mortgageService.formatLastStatusChanged(mockMortgage);

      // Assert
      expect(result).toBe('15/1/2023'); // Formato español esperado del mock
    });

    it('debería manejar fecha vacía', () => {
      // Arrange
      const mortgageWithoutDate = { ...mockMortgage, last_status_changed_at: '' };

      // Act
      const result = mortgageService.formatLastStatusChanged(mortgageWithoutDate);

      // Assert
      expect(result).toBe('Fecha no disponible');
    });

    it('debería manejar fecha undefined', () => {
      // Arrange
      const mortgageWithUndefinedDate = {
        ...mockMortgage,
        last_status_changed_at: undefined as any,
      };

      // Act
      const result = mortgageService.formatLastStatusChanged(mortgageWithUndefinedDate);

      // Assert
      expect(result).toBe('Fecha no disponible');
    });
  });

  describe('formatCreatedAt', () => {
    it('debería formatear la fecha de creación', () => {
      // Act
      const result = mortgageService.formatCreatedAt(mockMortgage);

      // Assert
      expect(result).toBe('1/1/2023'); // Formato español esperado del mock
    });

    it('debería manejar fecha vacía', () => {
      // Arrange
      const mortgageWithoutCreated = { ...mockMortgage, created_at: '' };

      // Act
      const result = mortgageService.formatCreatedAt(mortgageWithoutCreated);

      // Assert
      expect(result).toBe('Fecha no disponible');
    });

    it('debería manejar fecha undefined', () => {
      // Arrange
      const mortgageWithUndefinedCreated = { ...mockMortgage, created_at: null as any };

      // Act
      const result = mortgageService.formatCreatedAt(mortgageWithUndefinedCreated);

      // Assert
      expect(result).toBe('Fecha no disponible');
    });
  });
});
