<template>
  <PropertyCard
    :property="property"
    property-type="realEstate"
    @click="$emit('click', property)"
    @view-details="$emit('viewDetails', property)"
  >
    <template #icon="{ config }">
      <v-icon size="64" color="grey">{{ config.icon }}</v-icon>
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
});
</script>