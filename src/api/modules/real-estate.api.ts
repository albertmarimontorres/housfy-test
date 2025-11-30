import http from "@/api/httpClient";
import { type RealEstateResponse, type RealEstateFilters } from "@/types/Property";

export const getRealEstatePropertiesApi = (filters?: RealEstateFilters) => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const queryString = params.toString();
  const url = queryString ? `/real-estate?${queryString}` : '/real-estate';
  
  return http.get<RealEstateResponse>(url);
};

export const getRealEstatePropertyApi = (uuid: string) =>
  http.get<{ success: boolean; message: string; property: import("@/types/Property").RealEstateProperty }>(`/real-estate/${uuid}`);