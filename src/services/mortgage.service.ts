import type { Mortgage } from '@/types/Mortgage';
import { MORTGAGE_CONFIG } from '@/types/Mortgage';
import { 
  formatPrice, 
  formatDate
} from './property.service';

/**
 * Valida que la hipoteca sea un objeto válido
 */
const validateMortgage = (mortgage: Mortgage): void => {
  if (!mortgage || typeof mortgage !== 'object') {
    throw new Error('La hipoteca debe ser un objeto válido');
  }
};

/**
 * Valida que el estado sea una cadena válida
 */
const validateStatus = (status: string): void => {
  if (typeof status !== 'string') {
    throw new Error('El estado debe ser una cadena de texto');
  }
  
  if (!status.trim()) {
    throw new Error('El estado no puede estar vacío');
  }
};

/**
 * Convierte céntimos de euro a euros de forma segura
 * @param amountInCents - Cantidad en céntimos (ej: 25000 = 250.00€)
 * @returns Cantidad en euros o null si es inválida
 */
const convertCentsToEuros = (amountInCents: number | undefined | null): number | null => {
  if (typeof amountInCents !== 'number' || amountInCents < 0) {
    return null;
  }
  
  return amountInCents / 100;
};

/**
 * Obtiene la opción de estado de manera segura
 */
const getStatusOption = (status: string, statusOptions: any[]) => {
  return statusOptions.find(option => option?.value === status) || null;
};

export const mortgageService = {
  /**
   * Obtiene la configuración específica para hipotecas
   */
  getConfig() {
    return MORTGAGE_CONFIG;
  },

  /**
   * Formatea el importe del préstamo
   */
  formatLoanAmount(mortgage: Mortgage): string {
    // Early return para validaciones
    validateMortgage(mortgage);
    
    const loanAmountInEuros = convertCentsToEuros(mortgage.loanAmountMinUnit);
    
    if (loanAmountInEuros === null) {
      return 'Importe no disponible';
    }
    
    return formatPrice(loanAmountInEuros);
  },

  /**
   * Formatea el valor de la propiedad
   */
  formatPropertyValue(mortgage: Mortgage): string {
    // Early return para validaciones
    validateMortgage(mortgage);
    
    const propertyValueInEuros = convertCentsToEuros(mortgage.propertyValueMinUnit);
    
    if (propertyValueInEuros === null) {
      return 'Valor no disponible';
    }
    
    return formatPrice(propertyValueInEuros);
  },

  /**
   * Formatea el ratio Loan-to-Value (LTV)
   */
  formatLTV(mortgage: Mortgage): string {
    // Early return para validaciones
    validateMortgage(mortgage);
    
    if (typeof mortgage.ltv !== 'number' || mortgage.ltv < 0 || mortgage.ltv > 100) {
      return 'LTV no disponible';
    }
    
    return `${mortgage.ltv}%`;
  },

  /**
   * Obtiene el color del estado de una hipoteca
   */
  getStatusColor(status: string): string {
    // Early return para validaciones
    validateStatus(status);
    
    const mortgageConfig = this.getConfig();
    const statusOption = getStatusOption(status, mortgageConfig.statusOptions);
    
    return statusOption?.color || 'grey';
  },

  /**
   * Obtiene el label del estado de una hipoteca
   */
  getStatusLabel(status: string): string {
    // Early return para validaciones
    validateStatus(status);
    
    const mortgageConfig = this.getConfig();
    const statusOption = getStatusOption(status, mortgageConfig.statusOptions);
    
    return statusOption?.title || status;
  },

  /**
   * Formatea la información de ubicación de una hipoteca
   */
  formatLocation(mortgage: Mortgage): string {
    // Early return para validaciones
    validateMortgage(mortgage);
    
    if (!mortgage.city?.trim()) {
      return 'Ciudad no disponible';
    }
    
    return mortgage.city.trim();
  },

  /**
   * Genera una descripción de la hipoteca usando métodos modernos de array
   */
  generateDescription(mortgage: Mortgage): string {
    // Early return para validaciones
    validateMortgage(mortgage);
    
    const descriptionParts = [
      mortgage.bank?.trim(),
      typeof mortgage.ltv === 'number' ? `LTV: ${mortgage.ltv}%` : null
    ]
    .filter(Boolean) // Eliminar valores falsy
    .reduce((accumulator: string[], currentPart) => {
      if (currentPart && typeof currentPart === 'string') {
        accumulator.push(currentPart);
      }
      return accumulator;
    }, []);
    
    return descriptionParts.length > 0 
      ? descriptionParts.join(' • ')
      : 'Información no disponible';
  },

  /**
   * Formatea las fechas de manera segura
   */
  formatLastStatusChanged(mortgage: Mortgage): string {
    // Early return para validaciones
    validateMortgage(mortgage);
    
    if (!mortgage.last_status_changed_at) {
      return 'Fecha no disponible';
    }
    
    try {
      return formatDate(mortgage.last_status_changed_at);
    } catch (error) {
      return 'Fecha inválida';
    }
  },

  formatCreatedAt(mortgage: Mortgage): string {
    // Early return para validaciones
    validateMortgage(mortgage);
    
    if (!mortgage.created_at) {
      return 'Fecha no disponible';
    }
    
    try {
      return formatDate(mortgage.created_at);
    } catch (error) {
      return 'Fecha inválida';
    }
  }
};