<template>
  <v-app>
    <v-container fluid class="fill-height pa-0">
      <v-row no-gutters class="fill-height">
        <!-- Columna izquierda -->
        <v-col cols="12" md="6" class="d-flex flex-column align-start justify-center left-col position-relative">
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
                Gestiona, compra, vende o alquila tu vivienda con la plataforma digital líder en España.
              </span>
            </div>
          </div>
        </v-col>
        <!-- Columna derecha: login/register -->
        <v-col cols="12" md="6" class="d-flex align-center justify-center">
            <router-view />
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
  background: url('https://static0.housfy.com/prod/blog/images/2019/04/30155650/DSC04355.jpg') center center/cover no-repeat;
  overflow: hidden;
}
.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.65);
  z-index: 1;
}
.form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: rgba(255,255,255,0.95);
  border-radius: 12px;
  box-shadow: 0 2px 16px 0 rgba(0,0,0,0.08);
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
  text-shadow: 0 2px 8px rgba(0,0,0,0.25);
  line-height: 1.2;
}
</style>