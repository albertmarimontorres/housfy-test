<template>
    <div class="rentals-view">
        <!-- Header -->
        <div class="mb-6 w-100 px-4">
            <div class="d-flex flex-column flex-md-row align-center justify-md-space-between">
                <div class="d-flex align-center mb-4 mb-md-0">
                    <v-icon size="80" color="primary" class="me-4 d-none d-sm-flex">mdi-key-variant</v-icon>
                    <v-icon size="48" color="primary" class="me-3 d-flex d-sm-none">mdi-key-variant</v-icon>
                    <div>
                        <h1 class="text-h5 text-md-h4 font-weight-bold mb-2">Alquileres</h1>
                        <p class="text-body-2 text-md-body-1 text-grey-darken-1">
                            Gestiona tus propiedades de alquiler
                        </p>
                    </div>
                </div>

                <v-btn color="primary" size="large" @click="refreshRentals" :loading="rentalStore.loading" class="align-self-start align-self-md-center">
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
                        <v-select v-model="filters.status" :items="statusOptions" label="Estado" clearable
                            @update:model-value="applyFilters" />
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-text-field v-model="filters.propertyStreet" label="Calle" clearable
                            @update:model-value="applyFilters" />
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-text-field v-model.number="filters.minPrice" label="Precio mínimo" type="number" clearable
                            @update:model-value="applyFilters" />
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-text-field v-model.number="filters.maxPrice" label="Precio máximo" type="number" clearable
                            @update:model-value="applyFilters" />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Loading Skeletons -->
        <div v-if="rentalStore.loading">
            <v-row>
                <v-col v-for="n in 8" :key="n" cols="12" sm="6" lg="4" xl="3">
                    <v-skeleton-loader type="card" height="400" />
                </v-col>
            </v-row>
        </div>

        <!-- Error State -->
        <v-alert v-else-if="rentalStore.error" type="error" class="mb-4">
            {{ rentalStore.error }}
        </v-alert>

        <!-- Empty State -->
        <v-card v-else-if="!rentalStore.hasRentals" class="text-center py-12" variant="outlined">
            <v-card-text>
                <v-icon size="80" color="grey" class="mb-4">
                    mdi-home-variant-outline
                </v-icon>
                <h3 class="text-h6 mb-2">No hay alquileres disponibles</h3>
                <p class="text-body-2 text-grey-darken-1">
                    No se encontraron propiedades de alquiler que coincidan con los filtros aplicados.
                </p>
            </v-card-text>
        </v-card>

        <!-- Rentals Grid -->
        <div v-else>
            <div class="d-flex align-center justify-between mb-4">
                <span class="text-body-1">
                    <strong>{{ rentalStore.rentalsCount }}</strong> alquiler{{ rentalStore.rentalsCount !== 1 ? 'es' :
                    '' }} encontrado{{ rentalStore.rentalsCount !== 1 ? 's' : '' }}
                </span>
            </div>

            <v-row>
                <v-col v-for="rental in rentalStore.rentals" :key="rental.uuid" cols="12" sm="6" lg="4" xl="3">
                    <RentalCard :rental="rental" @click="handleRentalClick" @view-details="handleViewDetails" />
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue';
import { useRentalStore } from '@/stores/rental.store';
import type { Rental, RentalFilters } from '@/types/Property';
import { PROPERTY_CONFIGS } from '@/types/Property';

// ✅ Lazy loading del componente RentalCard para listas grandes
const RentalCard = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "rental-components" */ '@/components/domain/RentalCard.vue'),
  loadingComponent: {
    template: `
      <div style="height: 400px;">
        <v-skeleton-loader type="card" height="400" />
      </div>
    `
  },
  delay: 200,
  timeout: 3000
});

export default defineComponent({
    name: 'RentalsView',
    components: {
        RentalCard,
    },
    data() {
        return {
            filters: {
                status: undefined,
                propertyStreet: undefined,
                minPrice: undefined,
                maxPrice: undefined,
            } as RentalFilters,
            statusOptions: PROPERTY_CONFIGS.rental?.statusOptions || [],
        };
    },
    computed: {
        rentalStore() {
            return useRentalStore();
        },
    },
    async mounted() {
        await this.rentalStore.fetchRentals();
    },
    methods: {
        // Frontend filtering since API doesn't support filters yet
        // TODO: When backend filtering is ready, this method would be:
        // async applyFilters() {
        //   const cleanFilters = Object.fromEntries(
        //     Object.entries(this.filters).filter(([_, value]) =>
        //       value !== null && value !== undefined && value !== ''
        //     )
        //   );
        //   await this.rentalStore.fetchRentals(cleanFilters);
        // }

        applyFilters() {            
            // Clean empty values from filters
            const cleanFilters = Object.fromEntries(
                Object.entries(this.filters).filter(([_, value]) =>
                    value !== null && value !== undefined && value !== ''
                )
            );

            // Apply filters on frontend since backend API is not ready for filtering
            this.rentalStore.applyFilters(cleanFilters);
        },
        
        async refreshRentals() {
            // Fetch all rentals and apply current filters
            await this.rentalStore.fetchRentals();
            if (Object.keys(this.filters).some(key => this.filters[key as keyof RentalFilters] !== undefined)) {
                this.applyFilters();
            }
        },
        handleRentalClick(rental: Rental) {
            console.log('Rental clicked:', rental);
            // TODO: Navigate to rental detail view
        },
        handleViewDetails(rental: Rental) {
            console.log('View details for rental:', rental);
            // TODO: Open rental detail modal or navigate to detail page
        },
    },
});
</script>

<style scoped>
.rentals-view {
    width: 100%;
}
</style>