<template>
  <v-card class="mortgage-card h-100" elevation="2" hover>
    <!-- Header con diseño específico para hipotecas (sin imagen) -->
    <div class="position-relative mortgage-header-container">
      <div class="mortgage-header bg-green-lighten-4 pa-6 text-center">
        <v-icon size="64" color="green-darken-2" class="mb-2">mdi-bank</v-icon>
        <h3 class="text-h6 font-weight-bold mb-1">{{ mortgage.bank }}</h3>
        <div class="text-body-2 text-green-darken-1">Hipoteca</div>
      </div>
      
      <!-- Status chip -->
      <v-chip
        :color="statusColor"
        size="small"
        class="position-absolute chip-with-shadow status-chip"
        style="top: 12px; right: 12px; z-index: 2;"
      >
        {{ statusLabel }}
      </v-chip>
    </div>

    <v-card-subtitle class="pt-2">
      <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
      {{ mortgage.city }}
    </v-card-subtitle>

    <v-card-text>
      <div class="mb-3">
        <div class="text-caption text-grey-darken-1 mb-1">Importe del préstamo</div>
        <div class="text-h6 font-weight-bold">
          {{ mortgageService.formatLoanAmount(mortgage) }}
        </div>
      </div>

      <div class="mb-3">
        <div class="text-caption text-grey-darken-1 mb-1">Valor de la propiedad</div>
        <div class="text-subtitle-1">
          {{ mortgageService.formatPropertyValue(mortgage) }}
        </div>
      </div>

      <div class="mb-3">
        <div class="text-caption text-grey-darken-1 mb-1">LTV (Loan-to-Value)</div>
        <div class="text-subtitle-1 font-weight-medium">
          {{ mortgageService.formatLTV(mortgage) }}
        </div>
      </div>

      <v-divider class="my-3" />

      <div class="d-flex justify-space-between text-caption text-grey-darken-1">
        <span>Creado: {{ mortgageService.formatCreatedAt(mortgage) }}</span>
        <span>Actualizado: {{ mortgageService.formatLastStatusChanged(mortgage) }}</span>
      </div>
      
      <!-- Action buttons -->
      <!-- <div class="d-flex justify-space-between align-center mt-3">
        <v-btn
          size="small"
          color="primary"
          variant="outlined"
          @click="$emit('viewDetails', mortgage)"
        >
          Ver detalles
        </v-btn>
      </div> -->
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Mortgage } from '@/types/Mortgage';
import { mortgageService } from '@/services/mortgage.service';

export default defineComponent({
  name: 'MortgageCard',
  props: {
    mortgage: {
      type: Object as () => Mortgage,
      required: true
    }
  },
  emits: ['click', 'viewDetails'],
  computed: {
    statusColor(): string {
      return mortgageService.getStatusColor(this.mortgage.status);
    },
    statusLabel(): string {
      return mortgageService.getStatusLabel(this.mortgage.status);
    },
    mortgageService() {
      return mortgageService;
    }
  }
});
</script>

<style scoped>
.mortgage-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
  overflow: hidden;
}

.mortgage-card:hover {
  transform: translateY(-2px);
}

.mortgage-header-container {
  position: relative;
  overflow: hidden;
}

.mortgage-header {
  background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
  border-bottom: 3px solid #4CAF50;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mortgage-card:hover .mortgage-header {
  background: linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%);
}

/* Chip styles with shadow and contrast - matching PropertyCard */
.chip-with-shadow {
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4) !important;
}

.chip-with-shadow .v-chip__content {
  font-weight: 700 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  letter-spacing: 0.5px;
}

/* Asegurar que los chips tengan fondo sólido con opacidad */
.chip-with-shadow.v-chip {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Status chips específicos con colores por estado */
.status-chip.v-chip {
  color: white !important;
}

/* Colores específicos para cada estado */
.status-chip.v-chip[data-v-chip-color="success"],
.status-chip.v-chip.text-success,
.status-chip.v-chip.v-chip--color.bg-success,
.status-chip.v-chip.v-chip--variant-elevated.bg-success {
  background-color: rgba(46, 125, 50, 0.95) !important;
}

.status-chip.v-chip[data-v-chip-color="warning"],
.status-chip.v-chip.text-warning,
.status-chip.v-chip.v-chip--color.bg-warning,
.status-chip.v-chip.v-chip--variant-elevated.bg-warning {
  background-color: rgba(245, 124, 0, 0.95) !important;
}

.status-chip.v-chip[data-v-chip-color="error"],
.status-chip.v-chip.text-error,
.status-chip.v-chip.v-chip--color.bg-error,
.status-chip.v-chip.v-chip--variant-elevated.bg-error {
  background-color: rgba(198, 40, 40, 0.95) !important;
}

.status-chip.v-chip[data-v-chip-color="info"],
.status-chip.v-chip.text-info,
.status-chip.v-chip.v-chip--color.bg-info,
.status-chip.v-chip.v-chip--variant-elevated.bg-info {
  background-color: rgba(25, 118, 210, 0.95) !important;
}

.status-chip.v-chip[data-v-chip-color="grey"],
.status-chip.v-chip.text-grey,
.status-chip.v-chip.v-chip--color.bg-grey,
.status-chip.v-chip.v-chip--variant-elevated.bg-grey {
  background-color: rgba(97, 97, 97, 0.95) !important;
}

/* Fallback para cualquier chip de status con color */
.status-chip.v-chip.v-chip--color {
  color: white !important;
}

/* Asegurar que todos los elementos del chip tengan texto blanco */
.chip-with-shadow * {
  color: white !important;
}

.chip-with-shadow .v-icon {
  color: white !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));
}
</style>