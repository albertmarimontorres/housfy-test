<template>
  <div class="real-estate-view">
    <!-- Header -->
    <div class="mb-6 w-100 px-4">
      <div class="d-flex flex-column flex-md-row align-center justify-md-space-between">
        <div class="d-flex align-center mb-4 mb-md-0">
          <v-icon size="80" color="primary" class="me-4 d-none d-sm-flex">mdi-home-city</v-icon>
          <v-icon size="48" color="primary" class="me-3 d-flex d-sm-none">mdi-home-city</v-icon>
          <div>
            <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">Compraventa</h1>
            <p class="text-body-2 text-md-body-1 text-grey-darken-1">
              Gestiona tus propiedades en venta
            </p>
          </div>
        </div>

        <v-btn
          color="primary"
          size="large"
          @click="refreshProperties"
          :loading="realEstateStore.loading"
          class="align-self-start align-self-md-center"
        >
          <v-icon start>mdi-refresh</v-icon>
          Actualizar
        </v-btn>
      </div>
    </div>

    <!-- Filters Section -->
    <v-card class="mb-6" elevation="1">
      <v-card-title>
        <v-icon start>mdi-filter</v-icon>
        Filtros
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Estado"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.propertyStreet"
              label="Calle"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model.number="filters.minPrice"
              label="Precio mínimo"
              type="number"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model.number="filters.maxPrice"
              label="Precio máximo"
              type="number"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading Skeletons -->
    <div v-if="realEstateStore.loading">
      <v-row>
        <v-col v-for="n in 8" :key="n" cols="12" sm="6" lg="4" xl="3">
          <v-skeleton-loader type="card" height="400" />
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="realEstateStore.error" type="error" class="mb-4">
      {{ realEstateStore.error }}
    </v-alert>

    <!-- Empty State -->
    <v-card v-else-if="!realEstateStore.hasProperties" class="text-center py-12" variant="outlined">
      <v-card-text>
        <v-icon size="80" color="grey" class="mb-4"> mdi-home-search-outline </v-icon>
        <h3 class="text-h6 mb-2">No hay propiedades disponibles</h3>
        <p class="text-body-2 text-grey-darken-1">
          No se encontraron propiedades que coincidan con los filtros aplicados.
        </p>
      </v-card-text>
    </v-card>

    <!-- Properties Grid -->
    <div v-else>
      <div class="d-flex align-center justify-space-between mb-4">
        <span class="text-body-1">
          <strong>{{ realEstateStore.propertiesCount }}</strong> propiedad{{
            realEstateStore.propertiesCount !== 1 ? 'es' : ''
          }}
          encontrada{{ realEstateStore.propertiesCount !== 1 ? 's' : '' }}
        </span>
      </div>

      <v-row>
        <v-col
          v-for="property in realEstateStore.properties"
          :key="property.uuid"
          cols="12"
          sm="6"
          lg="4"
          xl="3"
        >
          <RealEstateCard
            :property="property"
            @click="handlePropertyClick"
            @view-details="handleViewDetails"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { useRealEstateStore } from '@/stores/real-estate.store';
import type { RealEstateProperty, RealEstateFilters } from '@/types/Property';

// ✅ Lazy loading del componente RealEstateCard para mejor rendimiento
const RealEstateCard = defineAsyncComponent({
  loader: () =>
    import(
      /* webpackChunkName: "real-estate-components" */ '@/components/domain/RealEstateCard.vue'
    ),
  // Componente de carga mientras se carga
  loadingComponent: {
    template: `
      <div style="height: 400px;">
        <v-skeleton-loader type="card" height="400" />
      </div>
    `,
  },
  delay: 200, // Mostrar loading después de 200ms
  timeout: 3000, // Timeout después de 3s
});

export default defineComponent({
  name: 'RealEstateView',
  components: {
    RealEstateCard,
  },
  data() {
    return {
      filters: {
        status: undefined,
        propertyStreet: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      } as RealEstateFilters,
      statusOptions: [
        { title: 'Publicado', value: 'Publicado' },
        { title: 'Oferta recibida', value: 'Oferta recibida' },
        { title: 'Reservado', value: 'Reservado' },
        { title: 'Con visitas', value: 'Con visitas' },
      ],
    };
  },
  computed: {
    realEstateStore() {
      return useRealEstateStore();
    },
  },
  async mounted() {
    await this.realEstateStore.fetchProperties();
  },
  methods: {
    // Filtrado en frontend ya que la API no soporta filtros aún
    // TODO: Cuando el filtrado en backend esté listo, este método sería:
    // async applyFilters() {
    //   const cleanFilters = Object.fromEntries(
    //     Object.entries(this.filters).filter(([_, value]) =>
    //       value !== null && value !== undefined && value !== ''
    //     )
    //   );
    //   await this.realEstateStore.fetchProperties(cleanFilters);
    // }

    applyFilters() {
      // Limpiar valores vacíos de los filtros
      const cleanFilters = Object.fromEntries(
        Object.entries(this.filters).filter(
          ([_, value]) => value !== null && value !== undefined && value !== ''
        )
      );

      // Aplicar filtros en frontend ya que la API backend no está lista para filtrado
      this.realEstateStore.applyFilters(cleanFilters);
    },

    // Actualizar todas las propiedades y aplicar filtros actuales
    async refreshProperties() {
      await this.realEstateStore.fetchProperties();
      if (
        Object.keys(this.filters).some(
          key => this.filters[key as keyof RealEstateFilters] !== undefined
        )
      ) {
        this.applyFilters();
      }
    },
    // Manejo de clic en propiedad
    handlePropertyClick(_property: RealEstateProperty) {
      // TODO: Navegar a vista de detalle de propiedad
    },
    // Manejo de ver detalles de propiedad
    handleViewDetails(_property: RealEstateProperty) {
      // TODO: Abrir modal de detalle o navegar a página de detalle
    },
  },
});
</script>

<style scoped>
.real-estate-view {
  width: 100%;
}
</style>
