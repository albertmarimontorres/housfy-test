<template>
  <div class="public-layout">
    <header class="header">
      <h1>Mi App</h1>
    </header>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "PublicLayout",
});
</script>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  height: 100vh;
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
