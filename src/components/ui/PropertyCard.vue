<template>
  <v-card class="property-card" elevation="2" :ripple="false" @click="$emit('click', property)">
    <!-- Header con imagen y estado de la propiedad -->
    <div class="position-relative property-image-container">
      <!-- Imagen customizable slot -->
      <slot name="image" :property="property" :config="config" :image-url="propertyImageUrl">
        <v-img
          :src="propertyImageUrl"
          :alt="`Imagen de ${formatAddress(property.propertyStreet, property.propertyStreetNumber, property.propertyFloor)}`"
          height="200"
          cover
          class="property-image"
          @error="handleImageError"
          @load="console.log('Image loaded successfully:', propertyImageUrl)"
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
              <v-progress-circular indeterminate color="primary" size="32" />
            </div>
          </template>
        </v-img>
      </slot>

      <!-- Status chip -->
      <v-chip
        :color="statusConfig.color"
        size="small"
        class="position-absolute chip-with-shadow status-chip"
        style="top: 12px; right: 12px; z-index: 2"
      >
        {{ statusConfig.label }}
      </v-chip>

      <!-- Badge propiedad -->
      <v-chip
        :color="config.color"
        size="small"
        class="position-absolute property-type-badge chip-with-shadow type-chip"
        style="bottom: 12px; left: 12px; z-index: 2"
      >
        <v-icon start size="small">{{ config.icon }}</v-icon>
        {{ config.label }}
      </v-chip>
    </div>

    <!-- Property Info -->
    <v-card-title class="text-h6 pb-2">
      {{
        formatAddress(
          property.propertyStreet,
          property.propertyStreetNumber,
          property.propertyFloor
        )
      }}
    </v-card-title>

    <v-card-subtitle class="text-body-2 text-grey-darken-1 pb-1">
      <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
      {{ property.propertyStreet }}
    </v-card-subtitle>

    <v-card-text class="pt-2">
      <!-- Detalles de la propiedad -->
      <div class="d-flex align-center mb-2">
        <v-icon size="small" class="mr-1">mdi-stairs</v-icon>
        <span class="text-body-2 mr-3">Piso {{ property.propertyFloor }}º</span>

        <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
        <span class="text-body-2">{{ formatDate(property.created_at) }}</span>
      </div>

      <!-- detalles customizados slot -->
      <slot name="details" :property="property" :config="config" :format-date="formatDate">
        <!-- detalles por defecto -->
        <div class="mb-3">
          <div class="text-caption text-grey-darken-1">
            Última actualización: {{ formatDate(property.last_status_changed_at) }}
          </div>
        </div>
      </slot>

      <!-- Precio y Acción -->
      <div class="d-flex align-center justify-space-between">
        <span class="text-h6 font-weight-bold text-primary">
          {{ formatPropertyPrice(property.propertyPriceMinUnit, config.priceFormat) }}
        </span>

        <!-- Acción personalizada slot -->
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
  getPropertyConfig,
} from '@/services/property.service';
import {
  getPropertyImageByType,
  getDefaultPropertyImage,
  getTypedFallbackImage,
} from '@/utils/imageUtils';

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
  data() {
    return {
      imageError: false,
    };
  },
  computed: {
    config(): PropertyTypeConfig {
      return getPropertyConfig(this.propertyType);
    },
    statusConfig() {
      return getStatusConfig(this.property.status, this.propertyType);
    },
    propertyImageUrl(): string {
      if (this.imageError) {
        return getDefaultPropertyImage({ width: 400, height: 200 });
      }

      const propertyId = this.property.uuid || 'default';
      const imageUrl = getPropertyImageByType(this.propertyType, propertyId, {
        width: 400,
        height: 200,
      });

      return imageUrl;
    },
  },
  methods: {
    formatAddress,
    formatDate,
    formatPropertyPrice,
    handleImageError() {
      // Si ya estamos en modo error, usar SVG específico del tipo
      if (!this.imageError) {
        this.imageError = true;

        // Intentar con fallback específico del tipo antes de usar el genérico
        setTimeout(() => {
          const fallbackUrl = this.getTypedFallback();
          console.log('Using typed fallback:', fallbackUrl);
        }, 100);
      }
    },
    getTypedFallback() {
      return getTypedFallbackImage(this.propertyType, { width: 400, height: 200 });
    },
  },
});
</script>

<style scoped>
.property-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  overflow: hidden;
}

.property-card:hover {
  transform: translateY(-2px);
}

.property-image-container {
  position: relative;
  overflow: hidden;
}

.property-image {
  transition: transform 0.3s ease-in-out;
}

.property-card:hover .property-image {
  transform: scale(1.05);
}

.property-type-badge {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
}

/* Mejorar contraste de los chips sobre la imagen */
.chip-with-shadow {
  backdrop-filter: blur(8px);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 1px 3px rgba(0, 0, 0, 0.4) !important;
}

.chip-with-shadow .v-chip__content {
  font-weight: 700 !important;
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 0 5px rgba(0, 0, 0, 0.5) !important;
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
.status-chip.v-chip[data-v-chip-color='success'],
.status-chip.v-chip.text-success,
.status-chip.v-chip.v-chip--color.bg-success,
.status-chip.v-chip.v-chip--variant-elevated.bg-success {
  background-color: rgba(46, 125, 50, 0.95) !important;
}

.status-chip.v-chip[data-v-chip-color='warning'],
.status-chip.v-chip.text-warning,
.status-chip.v-chip.v-chip--color.bg-warning,
.status-chip.v-chip.v-chip--variant-elevated.bg-warning {
  background-color: rgba(245, 124, 0, 0.95) !important;
}

.status-chip.v-chip[data-v-chip-color='error'],
.status-chip.v-chip.text-error,
.status-chip.v-chip.v-chip--color.bg-error,
.status-chip.v-chip.v-chip--variant-elevated.bg-error {
  background-color: rgba(198, 40, 40, 0.95) !important;
}

.status-chip.v-chip[data-v-chip-color='info'],
.status-chip.v-chip.text-info,
.status-chip.v-chip.v-chip--color.bg-info,
.status-chip.v-chip.v-chip--variant-elevated.bg-info {
  background-color: rgba(25, 118, 210, 0.95) !important;
}

/* Fallback para cualquier chip de status con color */
.status-chip.v-chip.v-chip--color {
  color: white !important;
}

/* Type chips específicos */
.type-chip.v-chip {
  background: rgba(0, 0, 0, 0.8) !important;
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

/* Efecto overlay sutil en la imagen */
.property-image-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 1;
}
</style>
