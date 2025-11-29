<template>
  <div class="private-layout">

    <aside class="sidebar">
      <ul>
        <li><router-link to="/app/dashboard">Dashboard</router-link></li>
        <li><router-link to="/app/real-estate">Compraventa</router-link></li>
        <li><router-link to="/app/rentals">Alquileres</router-link></li>
        <li><router-link to="/app/mortgages">Hipotecas</router-link></li>
      </ul>
      <button class="logout-btn" @click="logout">Cerrar sesión</button>
    </aside>

    <main class="main">
      <header class="header">
        <h2>Área privada</h2>
      </header>

      <section class="content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/auth.store";

export default defineComponent({
  name: "PrivateLayout",
  methods: {
    logout() {
      const auth = useAuthStore();
      auth.logout();
      this.$router.push('/login')    }
  }
});
</script>

<style scoped>
.private-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background: #f3f3f3;
  padding: 1rem;
}

.logout-btn {
  margin-top: 2rem;
  width: 100%;
  padding: 0.5rem;
  background: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #c53030;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}
</style>
