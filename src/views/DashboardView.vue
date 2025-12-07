<template>
  <div class="dashboard-view">
    <!-- Header -->
    <div class="dashboard-header mb-8">
      <h1 class="text-h3 font-weight-bold text-primary mb-2">Dashboard</h1>
      <p class="text-h6 text-grey-darken-1">Gestiona tus propiedades y servicios inmobiliarios</p>
    </div>

    <!-- Navigation Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card
          class="navigation-card real-estate-card"
          elevation="8"
          hover
          @click="navigateToRealEstate"
        >
          <div class="card-gradient real-estate-gradient"></div>
          <v-card-text class="pa-6 text-center position-relative">
            <div class="icon-container mb-4">
              <v-icon size="80" color="white" class="main-icon">mdi-home-city</v-icon>
            </div>
            <h3 class="text-h4 font-weight-bold text-white mb-2">Inmobiliaria</h3>
            <p class="text-body-1 text-white text-opacity-90 mb-4">
              Gestiona propiedades en venta y sus características
            </p>
            <v-chip color="white" variant="outlined" size="small">
              <v-icon start size="small">mdi-trending-up</v-icon>
              Ventas
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          class="navigation-card rental-card"
          elevation="8"
          hover
          @click="navigateToRentals"
        >
          <div class="card-gradient rental-gradient"></div>
          <v-card-text class="pa-6 text-center position-relative">
            <div class="icon-container mb-4">
              <v-icon size="80" color="white" class="main-icon">mdi-key-variant</v-icon>
            </div>
            <h3 class="text-h4 font-weight-bold text-white mb-2">Alquileres</h3>
            <p class="text-body-1 text-white text-opacity-90 mb-4">
              Administra propiedades de alquiler y inquilinos
            </p>
            <v-chip color="white" variant="outlined" size="small">
              <v-icon start size="small">mdi-calendar-month</v-icon>
              Alquiler
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          class="navigation-card mortgage-card"
          elevation="8"
          hover
          @click="navigateToMortgages"
        >
          <div class="card-gradient mortgage-gradient"></div>
          <v-card-text class="pa-6 text-center position-relative">
            <div class="icon-container mb-4">
              <v-icon size="80" color="white" class="main-icon">mdi-bank</v-icon>
            </div>
            <h3 class="text-h4 font-weight-bold text-white mb-2">Hipotecas</h3>
            <p class="text-body-1 text-white text-opacity-90 mb-4">
              Controla préstamos hipotecarios y financiación
            </p>
            <v-chip color="white" variant="outlined" size="small">
              <v-icon start size="small">mdi-percent</v-icon>
              Finanzas
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Stats Row (Optional) -->
    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="stats-card" elevation="2">
          <v-card-title>
            <v-icon start>mdi-chart-line</v-icon>
            Resumen Rápido
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4" class="text-center">
                <div class="stat-number text-h4 text-primary font-weight-bold">24</div>
                <div class="stat-label text-body-2 text-grey-darken-1">Propiedades Activas</div>
              </v-col>
              <v-col cols="12" sm="4" class="text-center">
                <div class="stat-number text-h4 text-success font-weight-bold">8</div>
                <div class="stat-label text-body-2 text-grey-darken-1">Alquileres del Mes</div>
              </v-col>
              <v-col cols="12" sm="4" class="text-center">
                <div class="stat-number text-h4 text-warning font-weight-bold">3</div>
                <div class="stat-label text-body-2 text-grey-darken-1">Hipotecas Pendientes</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DashboardView',
  methods: {
    navigateToRealEstate() {
      this.$router.push('/app/real-estate');
    },
    navigateToRentals() {
      this.$router.push('/app/rentals');
    },
    navigateToMortgages() {
      this.$router.push('/app/mortgages');
    },
  },
});
</script>

<style scoped>
.dashboard-view {
  padding: 24px;
  min-height: 100vh;
}

.dashboard-header {
  text-align: center;
  padding: 20px 0;
}

/* Navigation Cards */
.navigation-card {
  height: 280px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  border-radius: 16px !important;
}

.navigation-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2) !important;
}

.card-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.95;
}

/* Modern gradient backgrounds */
.real-estate-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.rental-gradient {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.mortgage-gradient {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Icon styling */
.icon-container {
  position: relative;
  z-index: 2;
}

.main-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

/* Card content positioning */
.v-card-text {
  z-index: 2;
}

/* Glassmorphism effect on hover */
.navigation-card:hover .card-gradient::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* Stats card styling */
.stats-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px !important;
}

.stat-number {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Chips styling */
.v-chip {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .dashboard-view {
    padding: 16px;
  }
  
  .navigation-card {
    height: 240px;
    margin-bottom: 16px;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
}

/* Add subtle animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.main-icon {
  animation: float 3s ease-in-out infinite;
}

.navigation-card:hover .main-icon {
  animation-play-state: paused;
}
</style>