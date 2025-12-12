import { defineStore } from 'pinia';
import { getRealEstateProperties } from '@/services/real-estate.service';
import type { RealEstateProperty, RealEstateFilters } from '@/types/Property';

export const useRealEstateStore = defineStore('realEstate', {
  state: () => ({
    allProperties: [] as RealEstateProperty[], // Almacena todas las propiedades obtenidas para filtrado en FE
    filteredProperties: [] as RealEstateProperty[], // Almacena los resultados filtrados
    loading: false,
    error: null as string | null,
    filters: {} as RealEstateFilters,
  }),

  getters: {
    properties: (state): RealEstateProperty[] => state.filteredProperties,

    propertiesCount: (state): number => state.filteredProperties.length,

    hasProperties: (state): boolean => state.filteredProperties.length > 0,

    propertiesByStatus: (state): Record<string, RealEstateProperty[]> => {
      return state.filteredProperties.reduce(
        (acc: Record<string, RealEstateProperty[]>, property: RealEstateProperty) => {
          if (!acc[property.status]) {
            acc[property.status] = [];
          }
          acc[property.status]!.push(property);
          return acc;
        },
        {} as Record<string, RealEstateProperty[]>
      );
    },
  },

  actions: {
    // TODO: Implementación del backend sería:
    // async fetchProperties(filters?: RealEstateFilters) {
    //   this.loading = true;
    //   this.error = null;
    //
    //   const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    //   const response = await getRealEstateProperties(`?${queryParams}`);
    //
    //   if (response && response.success) {
    //     this.allProperties = response.properties;
    //     this.filters = filters || {};
    //   }
    // }

    async fetchProperties(filters?: RealEstateFilters) {
      this.loading = true;
      this.error = null;

      try {
        // Fetch de todas las propiedades desde backend (sin filtros aplicados en BE)
        // Como la API no está lista para filtrado, obtenemos todos los datos y filtramos en FE
        const response = await getRealEstateProperties();
        if (response && response.success && response.properties) {
          this.allProperties = response.properties;

          // Inicializar propiedades filtradas
          this.filteredProperties = [...response.properties];

          // Aplicar filtros en frontend si se proporcionan
          if (filters) {
            this.applyFilters(filters);
          }
        } else {
          this.allProperties = [];
          this.filteredProperties = [];
          this.error = response?.message || 'No se pudieron obtener las propiedades';
        }
      } catch (e: any) {
        this.allProperties = [];
        this.filteredProperties = [];
        this.error = e?.response?.data?.message || 'Error al obtener las propiedades';
      } finally {
        this.loading = false;
      }
    },

    // Aplicar filtros en el frontend (ya que el filtrado en backend no está listo)
    applyFilters(filters: RealEstateFilters) {
      this.filters = { ...filters };

      // Aplicar lógica de filtrado
      let filtered = [...this.allProperties];

      // Aplicar filtros de frontend al conjunto completo de datos
      if (this.filters.status) {
        filtered = filtered.filter(property => property.status === this.filters.status);
      }

      if (this.filters.propertyStreet) {
        filtered = filtered.filter(property =>
          property.propertyStreet.toLowerCase().includes(this.filters.propertyStreet!.toLowerCase())
        );
      }

      if (this.filters.minPrice !== undefined && this.filters.minPrice !== null) {
        filtered = filtered.filter(
          property => property.propertyPriceMinUnit >= this.filters.minPrice!
        );
      }

      if (this.filters.maxPrice !== undefined && this.filters.maxPrice !== null) {
        filtered = filtered.filter(
          property => property.propertyPriceMinUnit <= this.filters.maxPrice!
        );
      }

      this.filteredProperties = filtered;
    },

    setFilters(filters: RealEstateFilters) {
      this.filters = { ...filters };
    },

    clearFilters() {
      this.filters = {};
    },

    clearProperties() {
      this.allProperties = [];
      this.filteredProperties = [];
      this.error = null;
      this.filters = {};
    },

    getPropertyByUuid(uuid: string): RealEstateProperty | undefined {
      return this.allProperties.find((property: RealEstateProperty) => property.uuid === uuid);
    },
  },
});
