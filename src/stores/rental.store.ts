import { defineStore } from 'pinia';
import { getRentals } from '@/services/rental.service';
import type { Rental, RentalFilters } from '@/types/Property';

export const useRentalStore = defineStore('rental', {
  state: () => ({
    allRentals: [] as Rental[], // Store all fetched rentals for FE filtering
    filteredRentals: [] as Rental[], // Store filtered results
    loading: false,
    error: null as string | null,
    filters: {} as RentalFilters,
  }),
  
  getters: {
    rentals: (state): Rental[] => state.filteredRentals,

    activeRentals: (state): Rental[] => {
      return state.filteredRentals.filter(rental => rental.status === 'Publicado');
    },
    
    rentalsCount: (state): number => state.filteredRentals.length,
    
    hasRentals: (state): boolean => state.filteredRentals.length > 0,
    
    rentalsByStatus: (state): Record<string, Rental[]> => {
      return state.filteredRentals.reduce((acc: Record<string, Rental[]>, rental: Rental) => {
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
    // TODO: Backend implementation would be:
    // async fetchRentals(filters?: RentalFilters) {
    //   this.loading = true;
    //   this.error = null;
    //   
    //   const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    //   const response = await getRentals(`?${queryParams}`);
    //   
    //   if (response && response.success) {
    //     this.allRentals = response.properties;
    //     this.filters = filters || {};
    //   }
    // }

    async fetchRentals(filters?: RentalFilters) {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch all rentals from backend (no filters applied on BE)
        // Since API is not ready for filtering, we get all data and filter on FE
        const response = await getRentals();
        if (response && response.success && response.properties) {
          this.allRentals = response.properties; // API retorna "properties" no "rentals"
          
          // Initialize filtered rentals
          this.filteredRentals = [...response.properties];
          
          // Apply filters on frontend if provided
          if (filters) {
            this.applyFilters(filters);
          }
        } else {
          this.allRentals = [];
          this.filteredRentals = [];
          this.error = response?.message || 'No se pudieron obtener los alquileres';
        }
      } catch (e: any) {
        this.allRentals = [];
        this.filteredRentals = [];
        this.error = e?.response?.data?.message || 'Error al obtener los alquileres';
        console.error('Error fetching rentals:', e);
      } finally {
        this.loading = false;
      }
    },

    // Apply filters on the frontend (since backend filtering is not ready)
    applyFilters(filters: RentalFilters) {
      console.log('Applying rental filters:', filters);
      console.log('Current allRentals count:', this.allRentals.length);
      
      this.filters = { ...filters };
      
      // Apply filtering logic
      let filtered = [...this.allRentals];
      
      // Apply frontend filters to the complete dataset
      if (this.filters.status) {
        console.log('Filtering rentals by status:', this.filters.status);
        const beforeFilter = filtered.length;
        filtered = filtered.filter(rental => rental.status === this.filters.status);
        console.log(`Rental status filter: ${beforeFilter} -> ${filtered.length} properties`);
      }
      
      if (this.filters.propertyStreet) {
        console.log('Filtering rentals by street:', this.filters.propertyStreet);
        filtered = filtered.filter(rental => 
          rental.propertyStreet.toLowerCase().includes(this.filters.propertyStreet!.toLowerCase())
        );
      }
      
      if (this.filters.minPrice !== undefined && this.filters.minPrice !== null) {
        console.log('Filtering rentals by minPrice:', this.filters.minPrice);
        filtered = filtered.filter(rental => rental.propertyPriceMinUnit >= this.filters.minPrice!);
      }
      
      if (this.filters.maxPrice !== undefined && this.filters.maxPrice !== null) {
        console.log('Filtering rentals by maxPrice:', this.filters.maxPrice);
        filtered = filtered.filter(rental => rental.propertyPriceMinUnit <= this.filters.maxPrice!);
      }
      
      this.filteredRentals = filtered;
      
      console.log('Final filtered rentals count:', filtered.length);
    },
    
    setFilters(filters: RentalFilters) {
      this.filters = { ...filters };
    },
    
    clearFilters() {
      this.filters = {};
    },
    
    clearRentals() {
      this.allRentals = [];
      this.filteredRentals = [];
      this.error = null;
      this.filters = {};
    },
    
    getRentalByUuid(uuid: string): Rental | undefined {
      return this.allRentals.find((rental: Rental) => rental.uuid === uuid);
    },
  },
});