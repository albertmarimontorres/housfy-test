import http from '@/api/httpClient';
import type { MortgagesResponse } from '@/types/Mortgage';

export const mortgageApi = {
  /**
   * Obtiene la lista de hipotecas con filtros opcionales
   */
  async getMortgages(): Promise<MortgagesResponse> {
    const { data } = await http.get<MortgagesResponse>('/mortgages');
    return data;
  },
};