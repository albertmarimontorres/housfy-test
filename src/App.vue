<template>
  <router-view />
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout" top right>
    {{ snackbar.text }}
  </v-snackbar>
  
  <!-- Chatbot Widget Global -->
  <ChatWidget />
</template>
<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount } from 'vue';
import ChatWidget from "@/components/ui/ChatWidget.vue";

// Estado del snackbar
const snackbar = reactive({
  show: false,
  text: '',
  color: '',
  timeout: 3500,
});

// Función para manejar eventos de snackbar
const onShowSnackbar = (event: any) => {
  const { text, color = 'info', timeout = 3500 } = event.detail || {};
  snackbar.text = text;
  snackbar.color = color;
  snackbar.timeout = timeout;
  snackbar.show = true;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('show-snackbar', onShowSnackbar);
});

onBeforeUnmount(() => {
  window.removeEventListener('show-snackbar', onShowSnackbar);
});
</script>
