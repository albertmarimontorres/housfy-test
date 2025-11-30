import { getRealEstatePropertiesApi, getRealEstatePropertyApi } from '@/api/modules/real-estate.api';
import { type RealEstateFilters } from '@/types/Property';
import { 
  formatAddress as baseFormatAddress,
  formatPropertyPrice,
  getStatusConfig
} from '@/services/property.service';

export const getRealEstateProperties = async (filters?: RealEstateFilters) => {
  const response = await getRealEstatePropertiesApi(filters);
  return response.data;
};

export const getRealEstateProperty = async (uuid: string) => {
  const response = await getRealEstatePropertyApi(uuid);
  return response.data;
};

// Re-exportar funciones del servicio base para mantener compatibilidad
export const formatPrice = (price: number): string => {
  return formatPropertyPrice(price, 'sale');
};

export const formatAddress = baseFormatAddress;

export const getStatusLabel = (status: string): string => {
  return getStatusConfig(status, 'realEstate').label;
};

export const getStatusColor = (status: string): string => {
  return getStatusConfig(status, 'realEstate').color;
};