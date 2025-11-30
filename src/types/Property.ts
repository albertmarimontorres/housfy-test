// Tipo base común para todas las propiedades
export interface BaseProperty {
    uuid: string;
    propertyStreet: string;
    propertyStreetNumber: number;
    propertyFloor: number;
    status: string;
    propertyPriceMinUnit: number;
    last_status_changed_at: string;
    created_at: string;
}

// Alias específicos por dominio (para mantener semántica)
export type RealEstateProperty = BaseProperty;
export type Rental = BaseProperty;

// Respuesta base del API
export interface BasePropertyResponse {
    success: boolean;
    message: string;
    properties: BaseProperty[];
}

// Alias de respuestas por dominio
export type RealEstateResponse = BasePropertyResponse;
export type RentalsResponse = BasePropertyResponse;

// Filtros base
export interface BasePropertyFilters {
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyStreet?: string;
    propertyFloor?: number;
}

// Alias de filtros por dominio
export type RealEstateFilters = BasePropertyFilters;
export type RentalFilters = BasePropertyFilters;

// Configuración para diferentes tipos de propiedades
export interface PropertyTypeConfig {
    icon: string;
    priceFormat: 'sale' | 'rental';
    statusOptions: Array<{ title: string; value: string; color: string }>;
    emptyStateIcon: string;
    emptyStateTitle: string;
    emptyStateDescription: string;
}

// Configuraciones predefinidas
export const PROPERTY_CONFIGS: Record<string, PropertyTypeConfig> = {
    realEstate: {
        icon: 'mdi-home-outline',
        priceFormat: 'sale',
        statusOptions: [
            { title: 'Publicado', value: 'Publicado', color: 'success' },
            { title: 'Oferta recibida', value: 'Oferta recibida', color: 'warning' },
            { title: 'Reservado', value: 'Reservado', color: 'error' },
            { title: 'Con visitas', value: 'Con visitas', color: 'info' },
        ],
        emptyStateIcon: 'mdi-home-search-outline',
        emptyStateTitle: 'No hay propiedades disponibles',
        emptyStateDescription: 'No se encontraron propiedades que coincidan con los filtros aplicados.',
    },
    rental: {
        icon: 'mdi-home-variant-outline',
        priceFormat: 'rental',
        statusOptions: [
            { title: 'Publicado', value: 'Publicado', color: 'success' },
            { title: 'Solicitud recibida', value: 'Solicitud recibida', color: 'warning' },
            { title: 'Contrato firmado', value: 'Contrato firmado', color: 'info' },
        ],
        emptyStateIcon: 'mdi-home-variant-outline',
        emptyStateTitle: 'No hay alquileres disponibles',
        emptyStateDescription: 'No se encontraron propiedades de alquiler que coincidan con los filtros aplicados.',
    },
};