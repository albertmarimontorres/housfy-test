import { defineStore } from 'pinia';
import { getRentals } from '@/services/rental.service';
import type { Rental, RentalFilters } from '@/types/Property';

export const useRentalStore = defineStore('rental', {
  state: () => ({
    rentals: [] as Rental[],
    loading: false,
    error: null as string | null,
    filters: {} as RentalFilters,
  }),
  
  getters: {
    activeRentals: (state) => {
      return state.rentals.filter(rental => rental.status === 'Publicado');
    },
    rentalsCount: (state) => state.rentals.length,
    hasRentals: (state) => state.rentals.length > 0,
    rentalsByStatus: (state) => {
      return state.rentals.reduce((acc, rental) => {
        const status = rental.status || 'unknown';
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status]!.push(rental);
        return acc;
      }, {} as Record<string, Rental[]>);
    },
  },
  
  actions: {
    async fetchRentals(filters?: RentalFilters) {
      this.loading = true;
      this.error = null;
      
      if (filters) {
        this.filters = { ...filters };
      }
      
      try {
        const response = await getRentals(this.filters);
        if (response && response.success && response.properties) {
          this.rentals = response.properties; // API retorna "properties" no "rentals"
        } else {
          this.rentals = [];
          this.error = response?.message || 'No se pudieron obtener los alquileres';
        }
      } catch (e: any) {
        this.rentals = [];
        this.error = e?.response?.data?.message || 'Error al obtener los alquileres';
        console.error('Error fetching rentals:', e);
      } finally {
        this.loading = false;
      }
    },
    
    setFilters(filters: RentalFilters) {
      this.filters = { ...filters };
    },
    
    clearFilters() {
      this.filters = {};
    },
    
    clearRentals() {
      this.rentals = [];
      this.error = null;
      this.filters = {};
    },
    
    getRentalByUuid(uuid: string): Rental | undefined {
      return this.rentals.find(rental => rental.uuid === uuid);
    },
  },
});