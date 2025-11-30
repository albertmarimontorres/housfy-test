import type { Mortgage } from '@/types/Mortgage';
import { MORTGAGE_CONFIG } from '@/types/Mortgage';
import { 
  formatPrice, 
  formatDate
} from './property.service';

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
    if (mortgage.loanAmountMinUnit) {
      return formatPrice(mortgage.loanAmountMinUnit / 100); // Convertir de centavos a euros
    }
    return 'Importe no disponible';
  },

  /**
   * Formatea el valor de la propiedad
   */
  formatPropertyValue(mortgage: Mortgage): string {
    if (mortgage.propertyValueMinUnit) {
      return formatPrice(mortgage.propertyValueMinUnit / 100); // Convertir de centavos a euros
    }
    return 'Valor no disponible';
  },

  /**
   * Formatea el ratio Loan-to-Value (LTV)
   */
  formatLTV(mortgage: Mortgage): string {
    if (mortgage.ltv !== undefined && mortgage.ltv !== null) {
      return `${mortgage.ltv}%`;
    }
    return 'LTV no disponible';
  },

  /**
   * Obtiene el color del estado de una hipoteca
   */
  getStatusColor(status: string): string {
    const config = this.getConfig();
    const statusOption = config.statusOptions.find(option => option.value === status);
    return statusOption?.color || 'grey';
  },

  /**
   * Obtiene el label del estado de una hipoteca
   */
  getStatusLabel(status: string): string {
    const config = this.getConfig();
    const statusOption = config.statusOptions.find(option => option.value === status);
    return statusOption?.title || status;
  },

  /**
   * Formatea la información de ubicación de una hipoteca
   */
  formatLocation(mortgage: Mortgage): string {
    return mortgage.city || 'Ciudad no disponible';
  },

  /**
   * Genera una descripción de la hipoteca
   */
  generateDescription(mortgage: Mortgage): string {
    const parts = [];
    
    if (mortgage.bank) {
      parts.push(mortgage.bank);
    }
    
    if (mortgage.ltv !== undefined) {
      parts.push(`LTV: ${mortgage.ltv}%`);
    }
    
    return parts.join(' • ') || 'Información no disponible';
  },

  /**
   * Formatea las fechas
   */
  formatLastStatusChanged(mortgage: Mortgage): string {
    return formatDate(mortgage.last_status_changed_at);
  },

  formatCreatedAt(mortgage: Mortgage): string {
    return formatDate(mortgage.created_at);
  }
};