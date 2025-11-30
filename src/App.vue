<template>
  <router-view />
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout" top right>
    {{ snackbar.text }}
  </v-snackbar>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  data() {
    return {
      snackbar: {
        show: false,
        text: "",
        color: "",
        timeout: 3500,
      },
    };
  },
  created() {
    window.addEventListener("show-snackbar", this.onShowSnackbar);
  },
  beforeUnmount() {
    window.removeEventListener("show-snackbar", this.onShowSnackbar);
  },
  methods: {
    onShowSnackbar(event: any) {
      const { text, color = "info", timeout = 3500 } = event.detail || {};
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.timeout = timeout;
      this.snackbar.show = true;
    },
  },
});
</script>
