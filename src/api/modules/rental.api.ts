import http from "@/api/httpClient";
import { type RentalsResponse, type RentalFilters } from "@/types/Property";

export const getRentalsApi = (filters?: RentalFilters) => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const queryString = params.toString();
  const url = queryString ? `/rentals?${queryString}` : '/rentals';
  
  return http.get<RentalsResponse>(url);
};

export const getRentalApi = (uuid: string) =>
  http.get<{ success: boolean; message: string; property: import("@/types/Property").Rental }>(`/rentals/${uuid}`);