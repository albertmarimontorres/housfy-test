<template>
  <router-view />
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout" top right>
    {{ snackbar.text }}
  </v-snackbar>
  
  <!-- Chatbot Widget Global - Solo para usuarios autenticados -->
  <ChatWidget v-if="authStore.isAuthenticated" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ChatWidget from "@/components/ui/ChatWidget.vue";
import { useAuthStore } from "@/stores/auth.store";

export default defineComponent({
  name: 'App',
  components: {
    ChatWidget
  },
  data() {
    return {
      snackbar: {
        show: false,
        text: '',
        color: '',
        timeout: 3500,
      }
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    }
  },
  methods: {
    onShowSnackbar(event: any) {
      const { text, color = 'info', timeout = 3500 } = event.detail || {};
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.timeout = timeout;
      this.snackbar.show = true;
    }
  },
  mounted() {
    window.addEventListener('show-snackbar', this.onShowSnackbar);
  },
  beforeUnmount() {
    window.removeEventListener('show-snackbar', this.onShowSnackbar);
  }
});
</script>