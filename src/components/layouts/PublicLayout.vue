<template>
  <v-app>
    <v-container fluid class="fill-height pa-0">
      <v-row no-gutters class="fill-height">
        <!-- Columna izquierda - Oculto en móvil -->
        <v-col
          cols="12"
          md="6"
          class="d-flex flex-column align-start justify-center left-col position-relative d-none d-md-flex"
        >
          <div class="bg-overlay"></div>
          <!-- Logo arriba -->
          <div class="logo-top">
            <v-img
              src="https://www.integratecnologia.es/sites/default/files/housfy.png"
              alt="Housfy Logo"
              max-width="220"
              class="logo-img"
            />
          </div>
          <!-- Texto centrado verticalmente -->
          <div class="text-center-vertical">
            <div class="slogan-text">
              <span>
                Gestiona, compra, vende o alquila tu vivienda con la plataforma digital líder en
                España.
              </span>
            </div>
          </div>
        </v-col>

        <!-- Columna derecha: login/register -->
        <v-col
          cols="12"
          md="6"
          class="d-flex align-center justify-center"
          :class="{ 'mobile-bg': $vuetify.display.mobile }"
        >
          <!-- Fondo móvil superpuesto -->
          <div v-if="$vuetify.display.mobile" class="mobile-bg-overlay"></div>

          <!-- Contenedor del formulario con estilo móvil -->
          <div class="form-container" :class="{ 'mobile-form': $vuetify.display.mobile }">
            <router-view />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'PublicLayout' });
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.left-col {
  position: relative;
  background: url('https://static0.housfy.com/prod/blog/images/2019/04/30155650/DSC04355.jpg')
    center center/cover no-repeat;
  overflow: hidden;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1;
}

/* Móvil background */
.mobile-bg {
  position: relative;
  background: url('https://static0.housfy.com/prod/blog/images/2019/04/30155650/DSC04355.jpg')
    center center/cover no-repeat;
  overflow: hidden;
  min-height: 100vh;
}

.mobile-bg-overlay {
  /* Eliminar overlay - queremos que la imagen esté clara */
  display: none;
}

.form-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  padding: 1rem;
}

.mobile-form {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 2px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 2.5rem;
  margin: 1rem;
  position: relative;
  overflow: hidden;
}

.mobile-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: inherit;
  z-index: -1;
}

/* Asegurar que el texto sea legible en el formulario móvil */
.mobile-form :deep(.v-field__input),
.mobile-form :deep(.v-field__label),
.mobile-form :deep(.v-btn),
.mobile-form :deep(.v-card-title),
.mobile-form :deep(.v-card-text),
.mobile-form :deep(h1),
.mobile-form :deep(h2),
.mobile-form :deep(h3),
.mobile-form :deep(p),
.mobile-form :deep(span) {
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
  font-weight: 600 !important;
}

.mobile-form :deep(.v-field) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(5px);
  border-radius: 8px;
}

.mobile-form :deep(.v-field__input) {
  color: rgba(0, 0, 0, 0.95) !important;
  font-weight: 500 !important;
}

.mobile-form :deep(.v-field__label) {
  color: rgba(0, 0, 0, 0.8) !important;
  font-weight: 500 !important;
}

.mobile-form :deep(.v-btn) {
  font-weight: 600 !important;
  text-shadow: none !important;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.08);
}

.logo-top {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  z-index: 3;
  display: flex;
  justify-content: center;
}

.text-center-vertical {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 80%;
}

.logo-img {
  display: block;
}

.slogan-text {
  color: #fff;
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  line-height: 1.2;
}

/* Responsive ajustes */
@media (max-width: 960px) {
  .slogan-text {
    font-size: 1.8rem;
  }

  .mobile-form {
    max-width: 90vw;
  }
}

@media (max-width: 600px) {
  .mobile-form {
    padding: 1.5rem;
    margin: 0.5rem;
  }
}
</style>
