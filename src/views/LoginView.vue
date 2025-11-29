<template>
  <div class="auth-container">
    <h1>Login</h1>

    <form @submit.prevent="handleLogin">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />

      <button :disabled="loading">
        {{ loading ? "Loading..." : "Login" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <router-link to="/register">Create account</router-link>
  </div>
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
    }
  },

  methods: {
    async handleLogin() {
      const auth = useAuthStore();
      await auth.login({
        email: this.email,
        password: this.password,
      });

      if (auth.isAuthenticated) {
        this.$router.push("/app/dashboard");
      }
    }
  }
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
