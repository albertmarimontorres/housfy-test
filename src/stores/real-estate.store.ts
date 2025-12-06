import { defineStore } from 'pinia';
import { getRealEstateProperties } from '@/services/real-estate.service';
import type { RealEstateProperty, RealEstateFilters } from '@/types/Property';

export const useRealEstateStore = defineStore('realEstate', {
  state: () => ({
    allProperties: [] as RealEstateProperty[], // Store all fetched properties for FE filtering
    filteredProperties: [] as RealEstateProperty[], // Store filtered results
    loading: false,
    error: null as string | null,
    filters: {} as RealEstateFilters,
  }),
  
  getters: {
    properties: (state): RealEstateProperty[] => state.filteredProperties,
    
    propertiesCount: (state): number => state.filteredProperties.length,
    
    hasProperties: (state): boolean => state.filteredProperties.length > 0,
    
    propertiesByStatus: (state): Record<string, RealEstateProperty[]> => {
      return state.filteredProperties.reduce((acc: Record<string, RealEstateProperty[]>, property: RealEstateProperty) => {
        if (!acc[property.status]) {
          acc[property.status] = [];
        }
        acc[property.status]!.push(property);
        return acc;
      }, {} as Record<string, RealEstateProperty[]>);
    },
  },
  
  actions: {
    // TODO: Backend implementation would be:
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
        // Fetch all properties from backend (no filters applied on BE)
        // Since API is not ready for filtering, we get all data and filter on FE
        const response = await getRealEstateProperties();
        if (response && response.success && response.properties) {
          this.allProperties = response.properties;
          
          // Initialize filtered properties
          this.filteredProperties = [...response.properties];
          
          // Apply filters on frontend if provided
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
        console.error('Error fetching real estate properties:', e);
      } finally {
        this.loading = false;
      }
    },
    
    // Apply filters on the frontend (since backend filtering is not ready)
    applyFilters(filters: RealEstateFilters) {
      console.log('Applying filters:', filters);
      console.log('Current allProperties count:', this.allProperties.length);
      
      this.filters = { ...filters };
      
      // Apply filtering logic
      let filtered = [...this.allProperties];
      
      // Apply frontend filters to the complete dataset
      if (this.filters.status) {
        console.log('Filtering by status:', this.filters.status);
        const beforeFilter = filtered.length;
        filtered = filtered.filter(property => property.status === this.filters.status);
        console.log(`Status filter: ${beforeFilter} -> ${filtered.length} properties`);
      }
      
      if (this.filters.propertyStreet) {
        console.log('Filtering by street:', this.filters.propertyStreet);
        filtered = filtered.filter(property => 
          property.propertyStreet.toLowerCase().includes(this.filters.propertyStreet!.toLowerCase())
        );
      }
      
      if (this.filters.minPrice !== undefined && this.filters.minPrice !== null) {
        console.log('Filtering by minPrice:', this.filters.minPrice);
        filtered = filtered.filter(property => property.propertyPriceMinUnit >= this.filters.minPrice!);
      }
      
      if (this.filters.maxPrice !== undefined && this.filters.maxPrice !== null) {
        console.log('Filtering by maxPrice:', this.filters.maxPrice);
        filtered = filtered.filter(property => property.propertyPriceMinUnit <= this.filters.maxPrice!);
      }
      
      this.filteredProperties = filtered;
      
      console.log('Final filtered count:', filtered.length);
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