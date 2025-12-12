<template>
  <PropertyCard
    :property="rental"
    property-type="rental"
    @click="$emit('click', rental)"
    @view-details="$emit('viewDetails', rental)"
  >
    <template #image="{ property, imageUrl }">
      <v-img
        :src="imageUrl"
        :alt="`Apartamento en alquiler - ${property.propertyStreet}`"
        height="200"
        cover
        class="rental-image"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height bg-blue-lighten-4">
            <v-icon size="48" color="blue-darken-2">mdi-home-variant</v-icon>
          </div>
        </template>
      </v-img>
    </template>

    <!-- Slot para detalles adicionales específicos de rentals -->
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
import type { Rental } from '@/types/Property';

export default defineComponent({
  name: 'RentalCard',
  components: {
    PropertyCard,
  },
  props: {
    rental: {
      type: Object as PropType<Rental>,
      required: true,
    },
  },
  emits: ['click', 'viewDetails'],
});
</script>

<style scoped>
.rental-image {
  position: relative;
}

.rental-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 2;
}

.rental-badge {
  background-color: rgba(33, 150, 243, 0.9) !important;
  backdrop-filter: blur(4px);
}
</style>
