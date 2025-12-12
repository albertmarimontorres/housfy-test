import http from '@/api/httpClient';
import type { RentalsResponse, RentalFilters } from '@/types/Property';

/**
 * Construye la URL con parámetros de filtro
 */
const buildFilteredUrl = (baseUrl: string, filters?: RentalFilters): string => {
  if (!filters) return baseUrl;

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export const rentalApi = {
  /**
   * Obtiene la lista de propiedades de alquiler con filtros opcionales
   */
  async getRentals(filters?: RentalFilters): Promise<RentalsResponse> {
    const url = buildFilteredUrl('/rentals', filters);
    const { data } = await http.get<RentalsResponse>(url);
    return data;
  },
};
