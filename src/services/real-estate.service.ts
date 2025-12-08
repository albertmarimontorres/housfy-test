import { realEstateApi } from '@/api/modules/real-estate.api';
import { type RealEstateFilters, type RealEstateResponse } from '@/types/Property';
import { 
  formatAddress as baseFormatAddress,
  formatPropertyPrice,
  getStatusConfig
} from '@/services/property.service';

/**
 * Valida el UUID de una propiedad
 */
const validatePropertyUUID = (uuid: string): void => {
  if (typeof uuid !== 'string' || !uuid.trim()) {
    throw new Error('UUID de la propiedad es requerido');
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid.trim())) {
    throw new Error('UUID de la propiedad no tiene un formato válido');
  }
};

export const RealEstateService = {
  /**
   * Obtiene la lista de propiedades inmobiliarias con filtros opcionales
   */
  async getProperties(propertyFilters?: RealEstateFilters): Promise<RealEstateResponse> {
    try {
      const propertiesResponse = await realEstateApi.getProperties(propertyFilters);
      
      // La API ya devuelve los datos directamente
      return propertiesResponse;
    } catch (error) {
      // Re-lanzar error personalizado si es conocido
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Error desconocido al obtener las propiedades inmobiliarias');
    }
  },

  /**
   * Obtiene una propiedad específica por su UUID (placeholder para futuro endpoint)
   */
  async getPropertyById(propertyUUID: string) {
    // Early return para validación
    validatePropertyUUID(propertyUUID);
    
    // TODO: Implementar cuando esté disponible el endpoint específico
    throw new Error('Endpoint para obtener propiedad por ID no está implementado');
  }
};

// Re-exportar funciones del servicio para mantener compatibilidad
export const getRealEstateProperties = RealEstateService.getProperties;
export const getRealEstateProperty = RealEstateService.getPropertyById;

export const formatPrice = (price: number): string => {
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('El precio debe ser un número positivo');
  }
  
  return formatPropertyPrice(price, 'sale');
};

export const formatAddress = baseFormatAddress;

export const getStatusLabel = (status: string): string => {
  if (typeof status !== 'string' || !status.trim()) {
    return 'Estado desconocido';
  }
  
  return getStatusConfig(status, 'realEstate').label;
};

export const getStatusColor = (status: string): string => {
  if (typeof status !== 'string' || !status.trim()) {
    return 'grey';
  }
  
  return getStatusConfig(status, 'realEstate').color;
};