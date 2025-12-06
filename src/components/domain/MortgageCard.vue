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
        class="position-absolute"
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
      <div class="d-flex justify-space-between align-center mt-3">
        <v-btn
          size="small"
          color="primary"
          variant="outlined"
          @click="$emit('viewDetails', mortgage)"
        >
          Ver detalles
        </v-btn>
      </div>
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
</style>