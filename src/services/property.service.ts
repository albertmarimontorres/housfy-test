import type { BaseProperty, PropertyTypeConfig } from '@/types/Property';
import { PROPERTY_CONFIGS } from '@/types/Property';

/**
 * Valida que el precio sea un número válido
 */
const validatePrice = (price: number): void => {
  if (typeof price !== 'number') {
    throw new Error('El precio debe ser un número');
  }
  
  if (price < 0) {
    throw new Error('El precio no puede ser negativo');
  }
  
  if (!isFinite(price)) {
    throw new Error('El precio debe ser un número finito');
  }
};

/**
 * Valida los parámetros de dirección
 */
const validateAddressParams = (street: string, number: number, floor?: number): void => {
  if (typeof street !== 'string' || !street.trim()) {
    throw new Error('La calle debe ser una cadena no vacía');
  }
  
  if (typeof number !== 'number' || number <= 0) {
    throw new Error('El número debe ser un número positivo');
  }
  
  if (floor !== undefined && (typeof floor !== 'number' || floor < 0)) {
    throw new Error('El piso debe ser un número no negativo');
  }
};

/**
 * Valida la fecha
 */
const validateDateString = (dateString: string): void => {
  if (typeof dateString !== 'string' || !dateString.trim()) {
    throw new Error('La fecha debe ser una cadena no vacía');
  }
  
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('La fecha no tiene un formato válido');
  }
};

/**
 * Valida el tipo de propiedad
 */
const validatePropertyType = (propertyType: string): void => {
  if (typeof propertyType !== 'string' || !propertyType.trim()) {
    throw new Error('El tipo de propiedad debe ser una cadena no vacía');
  }
  
  if (!PROPERTY_CONFIGS[propertyType as keyof typeof PROPERTY_CONFIGS]) {
    throw new Error(`Tipo de propiedad '${propertyType}' no encontrado en la configuración`);
  }
};

/**
 * Valida que el array de propiedades sea válido
 */
const validatePropertiesArray = (properties: BaseProperty[]): void => {
  if (!Array.isArray(properties)) {
    throw new Error('Las propiedades deben ser un array');
  }
  
  if (properties.some(property => !property || typeof property !== 'object')) {
    throw new Error('Todas las propiedades deben ser objetos válidos');
  }
};

// Utilidades base para todas las propiedades
export const formatPrice = (price: number): string => {
  // Early return para validación
  validatePrice(price);
  
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    // Fallback si hay problema con Intl
    return `€${price.toFixed(0)}`;
  }
};

export const formatAddress = (street: string, number: number, floor?: number): string => {
  // Early return para validaciones
  validateAddressParams(street, number, floor);
  
  const cleanStreet = street.trim();
  const baseAddress = `${cleanStreet}, ${number}`;
  
  return floor ? `${baseAddress}, ${floor}º` : baseAddress;
};

export const formatDate = (dateString: string): string => {
  // Early return para validación
  validateDateString(dateString);
  
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    // Fallback si hay problema con la localización
    const isoString = new Date(dateString).toISOString();
    const datePart = isoString.split('T')[0];
    return datePart || dateString;
  }
};

// Formateo de precio según el tipo (venta o alquiler)
export const formatPropertyPrice = (price: number, type: 'sale' | 'rental'): string => {
  // Early return para validación
  validatePrice(price);
  
  if (type !== 'sale' && type !== 'rental') {
    throw new Error("El tipo debe ser 'sale' o 'rental'");
  }
  
  const formattedPrice = formatPrice(price);
  return type === 'rental' ? `${formattedPrice}/mes` : formattedPrice;
};

// Obtener configuración de estado según el tipo de propiedad
export const getStatusConfig = (status: string, propertyType: keyof typeof PROPERTY_CONFIGS) => {
  // Early return para validaciones
  if (typeof status !== 'string' || !status.trim()) {
    return { label: 'Estado desconocido', color: 'grey' };
  }
  
  validatePropertyType(propertyType);
  
  const propertyConfig = PROPERTY_CONFIGS[propertyType];
  if (!propertyConfig) {
    return { label: status, color: 'grey' };
  }
  
  const statusOption = propertyConfig.statusOptions.find(option => option?.value === status);
  
  return {
    label: statusOption?.title || status,
    color: statusOption?.color || 'grey',
  };
};

// Obtener configuración completa del tipo de propiedad
export const getPropertyConfig = (propertyType: keyof typeof PROPERTY_CONFIGS): PropertyTypeConfig => {
  // Early return para validación
  validatePropertyType(propertyType);
  
  const config = PROPERTY_CONFIGS[propertyType];
  if (!config) {
    throw new Error(`Configuración para el tipo de propiedad '${propertyType}' no encontrada`);
  }
  
  return config;
};

// Verificar si una propiedad está activa (estado publicado)
export const isActiveProperty = (property: BaseProperty): boolean => {
  // Early return para validación
  if (!property || typeof property !== 'object') {
    return false;
  }
  
  if (typeof property.status !== 'string') {
    return false;
  }
  
  return property.status === 'Publicado';
};

// Filtrar propiedades activas usando métodos modernos de array
export const getActiveProperties = (properties: BaseProperty[]): BaseProperty[] => {
  // Early return para validación
  validatePropertiesArray(properties);
  
  return properties.filter(isActiveProperty);
};

// Agrupar propiedades por estado usando reduce
export const groupPropertiesByStatus = (properties: BaseProperty[]): Record<string, BaseProperty[]> => {
  // Early return para validación
  validatePropertiesArray(properties);
  
  return properties.reduce((groupedProperties: Record<string, BaseProperty[]>, currentProperty) => {
    const propertyStatus = currentProperty.status || 'Sin estado';
    
    if (!groupedProperties[propertyStatus]) {
      groupedProperties[propertyStatus] = [];
    }
    
    groupedProperties[propertyStatus].push(currentProperty);
    return groupedProperties;
  }, {});
};