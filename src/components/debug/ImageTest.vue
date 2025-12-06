<template>
  <div class="image-test pa-4">
    <h2>Test de Imágenes</h2>
    
    <div class="mb-4">
      <h3>Picsum IDs Curados - Inmuebles</h3>
      <div class="d-flex ga-4 flex-wrap">
        <div v-for="(imageId, index) in curatedIds" :key="index" class="flex-column">
          <h4>ID: {{ imageId }}</h4>
          <v-img
            :src="`https://picsum.photos/id/${imageId}/300/200`"
            height="200"
            width="300"
            @load="console.log(`Picsum ID ${imageId} loaded`)"
            @error="console.log(`Picsum ID ${imageId} failed`)"
            class="mb-2"
          />
        </div>
      </div>
    </div>
    
    <div class="mb-4">
      <h3>Property Cards con IDs Curados</h3>
      <div class="d-flex ga-4 flex-wrap">
        <div v-for="(type, index) in propertyTypes" :key="index" class="flex-column">
          <h4>{{ type.label }}</h4>
          <v-img
            :src="type.imageUrl"
            height="200"
            width="300"
            @load="console.log(`${type.name} loaded`)"
            @error="console.log(`${type.name} failed`)"
            class="mb-2"
          />
        </div>
      </div>
    </div>
    
    <div class="mb-4">
      <h3>Data URL Test</h3>
      <v-img
        :src="dataUrlImage"
        height="200"
        width="400"
        @load="console.log('Data URL loaded')"
        @error="console.log('Data URL failed')"
      />
    </div>
    
    <div class="mb-4">
      <h3>Property Card Test</h3>
      <div class="d-flex ga-4 flex-wrap">
        <PropertyCard
          v-if="testProperty"
          :property="testProperty"
          property-type="rental"
        />
        <MortgageCard
          v-if="testMortgage"
          :mortgage="testMortgage"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PropertyCard from '@/components/ui/PropertyCard.vue';
import MortgageCard from '@/components/domain/MortgageCard.vue';
import { getPropertyImageByType } from '@/utils/imageUtils';

export default defineComponent({
  name: 'ImageTest',
  components: {
    PropertyCard,
    MortgageCard,
  },
  computed: {
    curatedIds() {
      // Los IDs curados que proporcionaste
      return [78, 299, 409, 437, 445, 625, 859, 939, 1059];
    },
    propertyTypes() {
      return [
        {
          name: 'rental',
          label: 'Apartamento en Alquiler',
          imageUrl: getPropertyImageByType('rental', 'test-rental-123', { width: 300, height: 200 })
        },
        {
          name: 'realEstate',
          label: 'Propiedad de Lujo',
          imageUrl: getPropertyImageByType('realEstate', 'test-luxury-789', { width: 300, height: 200 })
        }
        // Nota: Las hipotecas ya no usan imágenes, solo SVG específico
      ];
    },
    dataUrlImage() {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#4ECDC4"/>
          <text x="50%" y="50%" text-anchor="middle" font-size="24" fill="white">
            Test Image
          </text>
        </svg>
      `)}`;
    },
    testProperty() {
      return {
        uuid: 'test-uuid-123',
        propertyStreet: 'Calle de Prueba',
        propertyStreetNumber: 123,
        propertyFloor: 2,
        status: 'Publicado',
        propertyPriceMinUnit: 150000,
        last_status_changed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    },
    testMortgage() {
      return {
        uuid: 'test-mortgage-456',
        bank: 'Banco Central',
        city: 'Madrid',
        loanAmountMinUnit: 250000,
        propertyValueMinUnit: 320000,
        ltv: 78.1,
        status: 'Aprobado',
        last_status_changed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
    },
  },
});
</script>