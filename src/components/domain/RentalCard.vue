<template>
  <PropertyCard
    :property="rental"
    property-type="rental"
    @click="$emit('click', rental)"
    @view-details="$emit('viewDetails', rental)"
  >
    <!-- Customizar icono específico para rentals -->
    <template #icon="{ config }">
      <v-icon size="64" color="grey">{{ config.icon }}</v-icon>
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