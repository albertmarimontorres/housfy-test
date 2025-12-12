<template>
  <PropertyCard
    :property="property"
    property-type="realEstate"
    @click="$emit('click', property)"
    @view-details="$emit('viewDetails', property)"
  >
    <!-- Personalizar imagen específica para real estate -->
    <template #image="{ property, imageUrl }">
      <div class="position-relative property-image-container">
        <v-img
          :src="imageUrl"
          :alt="`Propiedad en venta - ${property.propertyStreet}`"
          height="200"
          cover
          class="real-estate-image property-image"
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height bg-orange-lighten-4">
              <v-icon size="48" color="orange-darken-8">mdi-home-city</v-icon>
            </div>
          </template>
        </v-img>
      </div>
    </template>

    <!-- Slot para detalles adicionales específicos de real estate -->
    <template #details="{ property, formatDate }">
      <div class="mb-3">
        <div class="text-caption text-grey-darken-1">
          Última actualización: {{ formatDate(property.last_status_changed_at) }}
        </div>
      </div>
    </template>
  </PropertyCard>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import PropertyCard from '@/components/ui/PropertyCard.vue';
import type { RealEstateProperty } from '@/types/Property';
import { getStatusConfig } from '@/services/property.service';

export default defineComponent({
  name: 'RealEstateCard',
  components: {
    PropertyCard,
  },
  props: {
    property: {
      type: Object as PropType<RealEstateProperty>,
      required: true,
    },
  },
  emits: ['click', 'viewDetails'],
  computed: {
    statusConfig() {
      return getStatusConfig(this.property.status, 'realEstate');
    },
  },
});
</script>

<style scoped>
.real-estate-image {
  position: relative;
}

.real-estate-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 2;
}

.real-estate-badge {
  background-color: rgba(255, 152, 0, 0.9) !important;
  backdrop-filter: blur(4px);
}

/* Estilos específicos para real estate chips */
.real-estate-status-chip {
  background-color: rgba(46, 125, 50, 0.98) !important;
  color: white !important;
  font-weight: 700 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.real-estate-type-badge {
  background-color: rgba(230, 74, 25, 0.98) !important;
  color: white !important;
  font-weight: 700 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Asegurar texto blanco en todos los elementos de los chips de real estate */
.real-estate-status-chip *,
.real-estate-type-badge * {
  color: white !important;
}

.real-estate-status-chip .v-icon,
.real-estate-type-badge .v-icon {
  color: white !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));
}

/* Overlay específico para mejorar contraste en real estate */
.real-estate-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0) 70%,
    rgba(0, 0, 0, 0.2) 100%
  );
  pointer-events: none;
  z-index: 1;
}
</style>
