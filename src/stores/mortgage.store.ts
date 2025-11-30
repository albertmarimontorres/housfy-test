import { defineStore } from 'pinia';
import { mortgageApi } from '@/api/modules/mortgage.api';
import type { Mortgage, MortgageFilters } from '@/types/Mortgage';

export const useMortgageStore = defineStore('mortgage', {
  state: () => ({
    mortgages: [] as Mortgage[],
    loading: false,
    error: null as string | null,
    filters: {} as MortgageFilters,
  }),
  
  getters: {
    filteredMortgages: (state) => {
      return state.mortgages.filter((mortgage) => {
        // Filtro por estado
        if (state.filters.status && mortgage.status !== state.filters.status) {
          return false;
        }

        // Filtro por importe mínimo del préstamo
        if (state.filters.minLoanAmount && mortgage.loanAmountMinUnit < state.filters.minLoanAmount * 100) {
          return false;
        }

        // Filtro por importe máximo del préstamo
        if (state.filters.maxLoanAmount && mortgage.loanAmountMinUnit > state.filters.maxLoanAmount * 100) {
          return false;
        }

        // Filtro por valor mínimo de la propiedad
        if (state.filters.minPropertyValue && mortgage.propertyValueMinUnit < state.filters.minPropertyValue * 100) {
          return false;
        }

        // Filtro por valor máximo de la propiedad
        if (state.filters.maxPropertyValue && mortgage.propertyValueMinUnit > state.filters.maxPropertyValue * 100) {
          return false;
        }

        // Filtro por ciudad
        if (state.filters.city && !mortgage.city.toLowerCase().includes(state.filters.city.toLowerCase())) {
          return false;
        }

        // Filtro por banco
        if (state.filters.bank && !mortgage.bank.toLowerCase().includes(state.filters.bank.toLowerCase())) {
          return false;
        }

        return true;
      });
    },
    isEmpty: (state) => state.mortgages.length === 0,
    mortgagesCount: (state) => state.mortgages.length,
    hasMortgages: (state) => state.mortgages.length > 0,
    hasFiltersApplied: (state) => 
      (state.filters.status && state.filters.status !== '') ||
      state.filters.minLoanAmount !== undefined ||
      state.filters.maxLoanAmount !== undefined ||
      state.filters.minPropertyValue !== undefined ||
      state.filters.maxPropertyValue !== undefined ||
      (state.filters.city && state.filters.city !== '') ||
      (state.filters.bank && state.filters.bank !== ''),
  },

  actions: {
    async fetchMortgages() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await mortgageApi.getMortgages();
        
        if (response.success) {
          this.mortgages = response.mortgages || [];
        } else {
          throw new Error('Error al obtener las hipotecas');
        }
      } catch (err) {
        console.error('Error fetching mortgages:', err);
        this.error = err instanceof Error ? err.message : 'Error desconocido';
        this.mortgages = [];
      } finally {
        this.loading = false;
      }
    },

    updateFilters(newFilters: Partial<MortgageFilters>) {
      this.filters = { ...this.filters, ...newFilters };
    },

    clearFilters() {
      this.filters = {
        status: '',
        minLoanAmount: undefined,
        maxLoanAmount: undefined,
        minPropertyValue: undefined,
        maxPropertyValue: undefined,
        city: '',
        bank: '',
      };
    },

    getMortgageById(uuid: string) {
      return this.mortgages.find(mortgage => mortgage.uuid === uuid);
    },

    // Resetear store
    $reset() {
      this.mortgages = [];
      this.loading = false;
      this.error = null;
      this.clearFilters();
    },
  },
});