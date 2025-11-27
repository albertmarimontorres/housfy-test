<!-- src/views/RegisterView.vue -->
<template>
  <div class="auth-container">
    <h1>Register</h1>

    <form @submit.prevent="handleRegister">
      <input
        v-model="fullName"
        type="text"
        placeholder="Full name"
        required
      />

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
        {{ loading ? "Creating..." : "Register" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </form>

    <router-link to="/login">Already have an account?</router-link>
  </div>
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
    }
  },

  methods: {
    async handleRegister() {
      const auth = useAuthStore();

      await auth.register({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
      });

      if (auth.isAuthenticated) {
        this.$router.push("/dashboard");
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
