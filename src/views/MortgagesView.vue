<template>
  <v-container class="pa-0" fluid>
    <v-row no-gutters>
      <v-col cols="12">
        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-6 w-100 px-4">
          <div>
            <p class="text-body-1 text-grey-darken-1">
              Gestiona tus hipotecas y préstamos
            </p>
          </div>

          <v-btn color="primary" size="large" @click="refreshMortgages" :loading="loading">
            <v-icon start>mdi-refresh</v-icon>
            Actualizar
          </v-btn>
        </div>

        <!-- Filtros -->
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
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filters.city"
                  label="Ciudad"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="filters.bank"
                  label="Banco"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model.number="filters.minLoanAmount"
                  label="Préstamo mínimo"
                  type="number"
                  clearable
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Loading State -->
        <div v-if="loading">
          <v-row>
            <v-col
              v-for="n in 6"
              :key="n"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-skeleton-loader
                type="card"
                height="300"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Error State -->
        <v-alert
          v-else-if="error"
          type="error"
          variant="tonal"
          class="mb-6"
        >
          {{ error }}
        </v-alert>

        <!-- Empty State -->
        <div
          v-else-if="isEmpty && !loading"
          class="text-center py-12"
        >
          <v-icon
            size="64"
            color="grey-lighten-1"
            class="mb-4"
          >
            {{ config.emptyStateIcon }}
          </v-icon>
          <h3 class="text-h5 mb-2 text-grey-darken-1">
            {{ config.emptyStateTitle }}
          </h3>
          <p class="text-grey-darken-1">
            {{ config.emptyStateDescription }}
          </p>
        </div>

        <!-- Hipotecas Grid -->
        <div v-else>
          <v-row>
            <v-col
              v-for="mortgage in filteredMortgages"
              :key="mortgage.uuid"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <MortgageCard :mortgage="mortgage" />
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useMortgageStore } from '@/stores/mortgage.store';
import { MORTGAGE_CONFIG } from '@/types/Mortgage';
import MortgageCard from '@/components/domain/MortgageCard.vue';

// Store
const mortgageStore = useMortgageStore();

// Computed properties basados en el store
const loading = computed(() => mortgageStore.loading);
const error = computed(() => mortgageStore.error);
const filteredMortgages = computed(() => mortgageStore.filteredMortgages);
const isEmpty = computed(() => mortgageStore.isEmpty);

// Acceso directo a filtros del store (sin computed)
const filters = mortgageStore.filters;

// Configuración del tipo de propiedad
const config = MORTGAGE_CONFIG;

// Opciones para el select de estado
const statusOptions = computed(() => 
  config.statusOptions.map(option => ({
    title: option.title,
    value: option.value
  }))
);

// Función para refrescar (consistente con otras vistas)
const refreshMortgages = () => {
  mortgageStore.fetchMortgages();
};

// Lifecycle
onMounted(() => {
  mortgageStore.fetchMortgages();
});
</script>

<style scoped>
.v-container {
  max-width: 100% !important;
  width: 100%;
}
</style>