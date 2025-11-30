import { getRentalsApi, getRentalApi } from '@/api/modules/rental.api';
import { type RentalFilters } from '@/types/Property';
import { 
  formatAddress as baseFormatAddress,
  formatPropertyPrice,
  getStatusConfig
} from '@/services/property.service';

export const getRentals = async (filters?: RentalFilters) => {
  const response = await getRentalsApi(filters);
  return response.data;
};

export const getRental = async (uuid: string) => {
  const response = await getRentalApi(uuid);
  return response.data;
};

// Re-exportar funciones del servicio base para mantener compatibilidad
export const formatMonthlyPrice = (price: number): string => {
  return formatPropertyPrice(price, 'rental');
};

export const formatAddress = baseFormatAddress;

export const getRentalStatusLabel = (status: string): string => {
  return getStatusConfig(status, 'rental').label;
};

export const getRentalStatusColor = (status: string): string => {
  return getStatusConfig(status, 'rental').color;
};