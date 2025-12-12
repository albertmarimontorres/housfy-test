import http from '@/api/httpClient';
import type { RealEstateResponse, RealEstateFilters } from '@/types/Property';

/**
 * Construye la URL con parámetros de filtro
 */
const buildFilteredUrl = (baseUrl: string, filters?: RealEstateFilters): string => {
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

export const realEstateApi = {
  /**
   * Obtiene la lista de propiedades inmobiliarias con filtros opcionales
   */
  async getProperties(filters?: RealEstateFilters): Promise<RealEstateResponse> {
    const url = buildFilteredUrl('/real-estate', filters);
    const { data } = await http.get<RealEstateResponse>(url);
    return data;
  },
};
