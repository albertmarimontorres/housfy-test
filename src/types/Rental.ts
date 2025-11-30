export interface Rental {
    uuid: string;
    propertyStreet: string;
    propertyStreetNumber: number;
    propertyFloor: number;
    status: 'Solicitud recibida' | 'Contrato firmado' | 'Publicado' | string;
    propertyPriceMinUnit: number;
    last_status_changed_at: string;
    created_at: string;
}

export interface RentalsResponse {
    success: boolean;
    message: string;
    properties: Rental[]; // Nota: el API retorna "properties" no "rentals"
}

export interface RentalFilters {
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyStreet?: string;
    propertyFloor?: number;
}