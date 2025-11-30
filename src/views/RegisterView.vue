<!-- src/views/RegisterView.vue -->
<template>
  <v-card class="pa-8 register-card" elevation="2">
    <div class="mb-6 text-center">
      <h2 class="text-h5 font-weight-bold mb-2">Crea tu cuenta</h2>
      <div class="text-grey-darken-1 mb-2">Rellena los campos para registrarte en la plataforma</div>
    </div>
    <v-form @submit.prevent="handleRegister" class="d-flex flex-column gap-6">
      <v-text-field
        v-model="fullName"
        label="Nombre completo"
        type="text"
        required
        prepend-inner-icon="mdi-account"
        autocomplete="name"
      />
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        required
        :rules="[validateEmail]"
        prepend-inner-icon="mdi-email"
        autocomplete="email"
      />
      <v-text-field
        v-model="password"
        label="Contraseña"
        type="password"
        required
        :rules="[validatePassword]"
        prepend-inner-icon="mdi-lock"
        autocomplete="new-password"
        hint="Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
        persistent-hint
      />
      <v-btn :loading="loading" :disabled="loading || !isFormValid" type="submit" color="primary" block class="mt-2">
        {{ loading ? "Creando..." : "Registrarse" }}
      </v-btn>
  <!-- Snackbar handled globally -->
    </v-form>
    <div class="mt-6 text-center">
      <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/auth.store";

export default defineComponent({
  name: "RegisterView",

  data() {
    return {
      fullName: "",
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
        this.fullName.trim().length > 0 &&
        this.validateEmail(this.email) === true &&
        this.validatePassword(this.password) === true
      );
    }
  },

  methods: {
    validateEmail(value: string) {
      const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
      return re.test(value) || 'Introduce un email válido';
    },
    validatePassword(value: string) {
      // At least 8 chars, one uppercase, one lowercase, one number, one special char
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
      return re.test(value) || 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.';
    },
    async handleRegister() {
      const auth = useAuthStore();

      await auth.register({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
      });

      if (auth.isAuthenticated) {
        window.dispatchEvent(new CustomEvent("show-snackbar", { detail: { text: "¡Registro exitoso!", color: "success" } }));
        this.$router.push("/app/dashboard");
      } else if (auth.error) {
        window.dispatchEvent(new CustomEvent("show-snackbar", { detail: { text: auth.error, color: "error" } }));
      }
    }
  }
});
</script>

<style scoped>
.register-card {
  max-width: 480px;
  min-height: 520px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
