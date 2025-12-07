import { rentalApi } from '@/api/modules/rental.api';
import { type RentalFilters, type RentalsResponse } from '@/types/Property';
import { 
  formatAddress as baseFormatAddress,
  formatPropertyPrice,
  getStatusConfig
} from '@/services/property.service';

export const RentalService = {
  /**
   * Obtiene la lista de alquileres con filtros opcionales
   */
  async getRentals(rentalFilters?: RentalFilters): Promise<RentalsResponse> {
    try {
      const rentalsResponse = await rentalApi.getRentals(rentalFilters);
      
      // La API ya devuelve los datos directamente
      return rentalsResponse;
    } catch (error) {
      // Re-lanzar error personalizado si es conocido
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error desconocido al obtener los alquileres');
    }
  },
};

// Re-exportar funciones del servicio para mantener compatibilidad
export const getRentals = RentalService.getRentals;

// Re-exportar funciones del servicio base para mantener compatibilidad
export const formatMonthlyPrice = (price: number): string => {
  if (typeof price !== 'number' || price < 0) {
    throw new Error('El precio mensual debe ser un número positivo');
  }
  
  return formatPropertyPrice(price, 'rental');
};

export const formatAddress = baseFormatAddress;

export const getRentalStatusLabel = (status: string): string => {
  if (typeof status !== 'string' || !status.trim()) {
    return 'Estado desconocido';
  }
  
  return getStatusConfig(status, 'rental').label;
};

export const getRentalStatusColor = (status: string): string => {
  if (typeof status !== 'string' || !status.trim()) {
    return 'grey';
  }
  
  return getStatusConfig(status, 'rental').color;
};