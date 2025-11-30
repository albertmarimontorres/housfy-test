import { defineStore } from 'pinia';
import { getRealEstateProperties } from '@/services/real-estate.service';
import type { RealEstateProperty, RealEstateFilters } from '@/types/Property';

export const useRealEstateStore = defineStore('realEstate', {
  state: () => ({
    properties: [] as RealEstateProperty[],
    loading: false,
    error: null as string | null,
    filters: {} as RealEstateFilters,
  }),
  
  getters: {
    filteredProperties: (state) => {
      return state.properties.filter(property => property.status === 'Publicado');
    },
    propertiesCount: (state) => state.properties.length,
    hasProperties: (state) => state.properties.length > 0,
    propertiesByStatus: (state) => {
      return state.properties.reduce((acc, property) => {
        if (!acc[property.status]) {
          acc[property.status] = [];
        }
        acc[property.status]!.push(property);
        return acc;
      }, {} as Record<string, RealEstateProperty[]>);
    },
  },
  
  actions: {
    async fetchProperties(filters?: RealEstateFilters) {
      this.loading = true;
      this.error = null;
      
      if (filters) {
        this.filters = { ...filters };
      }
      
      try {
        const response = await getRealEstateProperties(this.filters);
        if (response && response.success && response.properties) {
          this.properties = response.properties;
        } else {
          this.properties = [];
          this.error = response?.message || 'No se pudieron obtener las propiedades';
        }
      } catch (e: any) {
        this.properties = [];
        this.error = e?.response?.data?.message || 'Error al obtener las propiedades';
        console.error('Error fetching real estate properties:', e);
      } finally {
        this.loading = false;
      }
    },
    
    setFilters(filters: RealEstateFilters) {
      this.filters = { ...filters };
    },
    
    clearFilters() {
      this.filters = {};
    },
    
    clearProperties() {
      this.properties = [];
      this.error = null;
      this.filters = {};
    },
    
    getPropertyByUuid(uuid: string): RealEstateProperty | undefined {
      return this.properties.find(property => property.uuid === uuid);
    },
  },
});