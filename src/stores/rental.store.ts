import { defineStore } from 'pinia';
import { getRentals } from '@/services/rental.service';
import type { Rental, RentalFilters } from '@/types/Property';

export const useRentalStore = defineStore('rental', {
  state: () => ({
    allRentals: [] as Rental[], // Almacena todos los alquileres obtenidos para filtrado en FE
    filteredRentals: [] as Rental[], // Almacena los resultados filtrados
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
      return state.filteredRentals.reduce(
        (acc: Record<string, Rental[]>, rental: Rental) => {
          const status = rental.status || 'unknown';
          if (!acc[status]) {
            acc[status] = [];
          }
          acc[status]!.push(rental);
          return acc;
        },
        {} as Record<string, Rental[]>
      );
    },
  },

  actions: {
    // TODO: Implementación del backend sería:
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
        // Fetch de todos los alquileres desde backend (sin filtros aplicados en BE)
        // Como la API no está lista para filtrado, obtenemos todos los datos y filtramos en FE
        const response = await getRentals();
        if (response && response.success && response.properties) {
          this.allRentals = response.properties; // API retorna "properties" no "rentals"

          // Inicializar alquileres filtrados
          this.filteredRentals = [...response.properties];

          // Aplicar filtros en frontend si se proporcionan
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
      } finally {
        this.loading = false;
      }
    },

    // Aplicar filtros en el frontend (ya que el filtrado en backend no está listo)
    applyFilters(filters: RentalFilters) {
      this.filters = { ...filters };

      // Aplicar lógica de filtrado
      let filtered = [...this.allRentals];

      // Aplicar filtros de frontend al conjunto completo de datos
      if (this.filters.status) {
        filtered = filtered.filter(rental => rental.status === this.filters.status);
      }

      if (this.filters.propertyStreet) {
        filtered = filtered.filter(rental =>
          rental.propertyStreet.toLowerCase().includes(this.filters.propertyStreet!.toLowerCase())
        );
      }

      if (this.filters.minPrice !== undefined && this.filters.minPrice !== null) {
        filtered = filtered.filter(rental => rental.propertyPriceMinUnit >= this.filters.minPrice!);
      }

      if (this.filters.maxPrice !== undefined && this.filters.maxPrice !== null) {
        filtered = filtered.filter(rental => rental.propertyPriceMinUnit <= this.filters.maxPrice!);
      }

      this.filteredRentals = filtered;
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
  },
});
