<template>
  <v-card class="pa-8 login-card" elevation="2">
    <div class="mb-6 text-center">
      <h2 class="text-h5 font-weight-bold mb-2">Haz login en la plataforma</h2>
      <div class="text-grey-darken-1 mb-2">Introduce tus credenciales para acceder a tu área privada</div>
    </div>
    <v-form @submit.prevent="handleLogin" class="d-flex flex-column gap-6">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        required
        prepend-inner-icon="mdi-email"
        autocomplete="username"
      />
      <v-text-field
        v-model="password"
        label="Contraseña"
        type="password"
        required
        prepend-inner-icon="mdi-lock"
        autocomplete="current-password"
      />
      <v-btn :loading="loading" :disabled="loading || !isFormValid" type="submit" color="primary" block class="mt-2">
        Entrar
      </v-btn>
  <!-- Snackbar handled globally -->
    </v-form>
    <div class="mt-6 text-center">
      <router-link to="/register">¿No tienes cuenta? Regístrate</router-link>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/auth.store";

export default defineComponent({
  name: "LoginView",

  data() {
    return {
      email: "",
      password: "",
    };
  },

  computed: {
    loading() {
      return useAuthStore().loading;
    },
    error() {
      return useAuthStore().error;
    },
    isFormValid(): boolean {
      return (
        this.email.trim().length > 0 &&
        this.password.trim().length > 0
      );
    }
  },

  methods: {
    // Email validation removed as per user request
    async handleLogin() {
      const auth = useAuthStore();
      await auth.login({
        email: this.email,
        password: this.password,
      });

      if (auth.isAuthenticated) {
        window.dispatchEvent(new CustomEvent("show-snackbar", { detail: { text: "¡Bienvenido!", color: "success" } }));
        this.$router.push("/app/dashboard");
      } else if (auth.error) {
        window.dispatchEvent(new CustomEvent("show-snackbar", { detail: { text: auth.error, color: "error" } }));
      }
    }
  }
});
</script>

<style scoped>
.login-card {
  max-width: 480px;
  min-height: 520px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
