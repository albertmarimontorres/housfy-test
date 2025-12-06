<template>
  <div id="dashboard-view">
    <h1>Dashboard</h1>
    
    <!-- Test temporal de imágenes -->
    <ImageTest />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ImageTest from '@/components/debug/ImageTest.vue';

export default defineComponent({
  name: 'DashboardView',
  components: {
    ImageTest,
  },
});
</script>