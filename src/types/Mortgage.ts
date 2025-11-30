// Tipo específico para hipotecas
export interface Mortgage {
    uuid: string;
    bank: string;
    city: string;
    loanAmountMinUnit: number;
    propertyValueMinUnit: number;
    ltv: number;
    status: string;
    last_status_changed_at: string;
    created_at: string;
}

// Respuesta específica para hipotecas
export interface MortgagesResponse {
    success: boolean;
    message: string;
    mortgages: Mortgage[];
}

// Filtros específicos para hipotecas
export interface MortgageFilters {
    status?: string;
    minLoanAmount?: number;
    maxLoanAmount?: number;
    minPropertyValue?: number;
    maxPropertyValue?: number;
    city?: string;
    bank?: string;
}

// Configuración específica para hipotecas
export const MORTGAGE_CONFIG = {
    icon: 'mdi-home-outline',
    priceFormat: 'sale' as const,
    statusOptions: [
        { title: 'Aprobado', value: 'Aprobado', color: 'success' },
        { title: 'Pendiente', value: 'Pendiente', color: 'warning' },
        { title: 'Rechazado', value: 'Rechazado', color: 'error' },
        { title: 'En Proceso', value: 'En Proceso', color: 'info' },
        { title: 'Publicado', value: 'Publicado', color: 'info' },
    ],
    emptyStateIcon: 'mdi-home-search-outline',
    emptyStateTitle: 'No hay hipotecas disponibles',
    emptyStateDescription: 'No se encontraron hipotecas que coincidan con los filtros aplicados.',
};