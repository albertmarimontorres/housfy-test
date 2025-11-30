<template>
  <v-card
    class="property-card"
    elevation="2"
    :ripple="false"
    @click="$emit('click', property)"
  >
    <!-- Header with customizable icon and status -->
    <div
      class="d-flex align-center justify-center bg-grey-lighten-3 position-relative"
      style="height: 200px;"
    >
      <!-- Customizable icon slot -->
      <slot name="icon" :property="property" :config="config">
        <v-icon size="64" color="grey">{{ config.icon }}</v-icon>
      </slot>
      
      <!-- Status chip -->
      <v-chip
        :color="statusConfig.color"
        size="small"
        class="position-absolute"
        style="top: 12px; right: 12px;"
      >
        {{ statusConfig.label }}
      </v-chip>
    </div>

    <!-- Property Info -->
    <v-card-title class="text-h6 pb-2">
      {{ formatAddress(property.propertyStreet, property.propertyStreetNumber, property.propertyFloor) }}
    </v-card-title>

    <v-card-subtitle class="text-body-2 text-grey-darken-1 pb-1">
      <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
      {{ property.propertyStreet }}
    </v-card-subtitle>

    <v-card-text class="pt-2">
      <!-- Property Details -->
      <div class="d-flex align-center mb-2">
        <v-icon size="small" class="mr-1">mdi-stairs</v-icon>
        <span class="text-body-2 mr-3">Piso {{ property.propertyFloor }}º</span>
        
        <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
        <span class="text-body-2">{{ formatDate(property.created_at) }}</span>
      </div>

      <!-- Custom details slot -->
      <slot name="details" :property="property" :config="config" :format-date="formatDate">
        <!-- Default details -->
        <div class="mb-3">
          <div class="text-caption text-grey-darken-1">
            Última actualización: {{ formatDate(property.last_status_changed_at) }}
          </div>
        </div>
      </slot>

      <!-- Price and Action -->
      <div class="d-flex align-center justify-space-between	">
        <span class="text-h6 font-weight-bold text-primary">
          {{ formatPropertyPrice(property.propertyPriceMinUnit, config.priceFormat) }}
        </span>
        
        <!-- Custom action slot -->
        <slot name="action" :property="property">
          <v-btn
            size="small"
            color="primary"
            variant="outlined"
            @click.stop="$emit('viewDetails', property)"
          >
            Ver detalles
          </v-btn>
        </slot>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { BaseProperty, PropertyTypeConfig, PROPERTY_CONFIGS } from '@/types/Property';
import { 
  formatAddress, 
  formatDate, 
  formatPropertyPrice, 
  getStatusConfig, 
  getPropertyConfig 
} from '@/services/property.service';

export default defineComponent({
  name: 'PropertyCard',
  props: {
    property: {
      type: Object as PropType<BaseProperty>,
      required: true,
    },
    propertyType: {
      type: String as PropType<keyof typeof PROPERTY_CONFIGS>,
      required: true,
    },
  },
  emits: ['click', 'viewDetails'],
  computed: {
    config(): PropertyTypeConfig {
      return getPropertyConfig(this.propertyType);
    },
    statusConfig() {
      return getStatusConfig(this.property.status, this.propertyType);
    },
  },
  methods: {
    formatAddress,
    formatDate,
    formatPropertyPrice,
  },
});
</script>

<style scoped>
.property-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.property-card:hover {
  transform: translateY(-2px);
}
</style>