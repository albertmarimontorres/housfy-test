export interface RealEstateProperty {
    uuid: string;
    propertyStreet: string;
    propertyStreetNumber: number;
    propertyFloor: number;
    status: 'Publicado' | 'Oferta recibida' | 'Reservado' | 'Con visitas' | string;
    propertyPriceMinUnit: number;
    last_status_changed_at: string;
    created_at: string;
}

export interface RealEstateResponse {
    success: boolean;
    message: string;
    properties: RealEstateProperty[];
}

export interface RealEstateFilters {
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyStreet?: string;
    propertyFloor?: number;
}