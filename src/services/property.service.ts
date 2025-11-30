import type { BaseProperty, PropertyTypeConfig } from '@/types/Property';
import { PROPERTY_CONFIGS } from '@/types/Property';

// Utilidades base para todas las propiedades
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatAddress = (street: string, number: number, floor?: number): string => {
  const baseAddress = `${street}, ${number}`;
  return floor ? `${baseAddress}, ${floor}º` : baseAddress;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Formateo de precio según el tipo (venta o alquiler)
export const formatPropertyPrice = (price: number, type: 'sale' | 'rental'): string => {
  const formattedPrice = formatPrice(price);
  return type === 'rental' ? `${formattedPrice}/mes` : formattedPrice;
};

// Obtener configuración de estado según el tipo de propiedad
export const getStatusConfig = (status: string, propertyType: keyof typeof PROPERTY_CONFIGS) => {
  const config = PROPERTY_CONFIGS[propertyType];
  if (!config) {
    return { label: status, color: 'grey' };
  }
  
  const statusOption = config.statusOptions.find(option => option.value === status);
  
  return {
    label: statusOption?.title || status,
    color: statusOption?.color || 'grey',
  };
};

// Obtener configuración completa del tipo de propiedad
export const getPropertyConfig = (propertyType: keyof typeof PROPERTY_CONFIGS): PropertyTypeConfig => {
  const config = PROPERTY_CONFIGS[propertyType];
  if (!config) {
    throw new Error(`Property type '${propertyType}' not found in PROPERTY_CONFIGS`);
  }
  return config;
};

// Verificar si una propiedad está activa (estado publicado)
export const isActiveProperty = (property: BaseProperty): boolean => {
  return property.status === 'Publicado';
};

// Filtrar propiedades activas
export const getActiveProperties = (properties: BaseProperty[]): BaseProperty[] => {
  return properties.filter(property => isActiveProperty(property));
};

// Agrupar propiedades por estado
export const groupPropertiesByStatus = (properties: BaseProperty[]): Record<string, BaseProperty[]> => {
  return properties.reduce((acc, property) => {
    if (!acc[property.status]) {
      acc[property.status] = [];
    }
    acc[property.status]!.push(property);
    return acc;
  }, {} as Record<string, BaseProperty[]>);
};