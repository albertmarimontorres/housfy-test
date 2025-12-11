<template>
  <v-app>
    <!-- Drawer - Oculto en móvil -->
    <v-navigation-drawer 
      v-model="drawer" 
      :permanent="!$vuetify.display.mobile"
      :temporary="$vuetify.display.mobile"
      app
    >
      <div class="d-flex flex-row align-center py-6 px-4">
        <v-skeleton-loader v-if="profileLoading" type="avatar" width="56" height="56" />
        <v-avatar v-else color="primary" size="56">
          <span class="white--text text-h6">{{ profileInitial }}</span>
        </v-avatar>

        <div class="ml-4">
          <div class="text-body-2">Hola</div>
          <v-skeleton-loader v-if="profileLoading" type="text" width="120" height="20" />
          <div v-else class="font-weight-bold text-body-1" v-if="profileStore.user && profileStore.user.fullName">{{
            formattedFullName }}</div>
        </div>
      </div>

      <v-list nav dense>
        <v-list-item to="/app/dashboard" router exact @click="closeMobileDrawer">
          <template #prepend>
            <v-icon size="28">mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item to="/app/real-estate" router @click="closeMobileDrawer">
          <template #prepend>
            <v-icon size="28">mdi-home-city</v-icon>
          </template>
          <v-list-item-title>Compraventa</v-list-item-title>
        </v-list-item>
        <v-list-item to="/app/rentals" router @click="closeMobileDrawer">
          <template #prepend>
            <v-icon size="28">mdi-key-variant</v-icon>
          </template>
          <v-list-item-title>Alquileres</v-list-item-title>
        </v-list-item>
        <v-list-item to="/app/mortgages" router @click="closeMobileDrawer">
          <template #prepend>
            <v-icon size="28">mdi-bank</v-icon>
          </template>
          <v-list-item-title>Hipotecas</v-list-item-title>
        </v-list-item>
        
        <!-- Cerrar sesión en el menú móvil -->
        <v-divider v-if="$vuetify.display.mobile" class="my-2" />
        <v-list-item v-if="$vuetify.display.mobile" @click="logout">
          <template #prepend>
            <v-icon>mdi-logout</v-icon>
          </template>
          <v-list-item-title>Cerrar sesión</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-app-bar app color="primary" dark>
        <div class="w-100 d-flex align-center justify-space-between px-4">
          <div class="d-flex align-center">
            <!-- Menú hamburguesa móvil -->
            <v-btn 
              v-if="$vuetify.display.mobile"
              icon 
              color="white"
              @click="drawer = !drawer"
              class="mr-3"
            >
              <v-icon>mdi-menu</v-icon>
            </v-btn>
            
            <v-icon class="mr-3" size="28">{{ pageIcon }}</v-icon>
            <v-breadcrumbs
              :items="breadcrumbItems"
              color="white"
              divider="/"
              class="pa-0"
            >
              <template #item="{ item }">
                <v-breadcrumbs-item
                  :to="item.to"
                  :disabled="item.disabled"
                  :class="item.disabled ? 'text-white font-weight-bold' : 'text-white'"
                >
                  {{ item.title }}
                </v-breadcrumbs-item>
              </template>
              <template #divider>
                <v-icon color="white" size="16">mdi-chevron-right</v-icon>
              </template>
            </v-breadcrumbs>
          </div>
          
          <!-- Botón de cerrar sesión - solo visible en escritorio -->
          <v-tooltip 
            v-if="!$vuetify.display.mobile"
            text="Cerrar sesión" 
            location="bottom"
          >
            <template #activator="{ props }">
              <v-btn icon color="white" v-bind="props" @click="logout">
                <v-icon>mdi-logout</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </v-app-bar>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
    <v-dialog v-model="profileLoading" persistent width="100">
      <v-card color="transparent" elevation="0" class="d-flex justify-center align-center">
        <v-progress-circular indeterminate color="primary" />
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useProfileStore } from "@/stores/profile.store";

export default defineComponent({
  name: "PrivateLayout",
  data() {
    return {
      drawer: true,
    };
  },
  computed: {
    profileStore() {
      return useProfileStore();
    },
    profileInitial(): string {
      const user = this.profileStore.user;
      if (!user) return 'A';
      if (user.fullName && user.fullName.length > 0) return user.fullName[0]!.toUpperCase();
      if (user.email && user.email.length > 0) return user.email[0]!.toUpperCase();
      return 'A';
    },
    profileLoading() {
      return this.profileStore.loading;
    },
    formattedFullName(): string {
      const user = this.profileStore.user;
      if (!user || !user.fullName) return '';
      return user.fullName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },
    pageTitle() {
      const route = this.$route;
      const nameMap = {
        Dashboard: 'Dashboard',
        RealEstate: 'Compraventa',
        Rentals: 'Alquileres',
        Mortgages: 'Hipotecas',
      };
      const routeName = typeof route.name === 'string' ? route.name : '';
      if (routeName === 'Dashboard' || routeName === 'RealEstate' || routeName === 'Rentals' || routeName === 'Mortgages') {
        return nameMap[routeName];
      }
      return 'Área privada';
    },
    breadcrumbItems() {
      const route = this.$route;
      const routeName = typeof route.name === 'string' ? route.name : '';
      
      const breadcrumbs = [
        {
          title: 'Inicio',
          to: '/app/dashboard',
          disabled: false
        }
      ];

      const routeMap = {
        Dashboard: { title: 'Dashboard', to: '/app/dashboard' },
        RealEstate: { title: 'Compraventa', to: '/app/real-estate' },
        Rentals: { title: 'Alquileres', to: '/app/rentals' },
        Mortgages: { title: 'Hipotecas', to: '/app/mortgages' },
      };

      if (routeName !== 'Dashboard' && routeMap[routeName as keyof typeof routeMap]) {
        const currentRoute = routeMap[routeName as keyof typeof routeMap];
        breadcrumbs.push({
          title: currentRoute.title,
          to: currentRoute.to,
          disabled: true // Página actual deshabilitada
        });
      }

      return breadcrumbs;
    },
    pageIcon() {
      const route = this.$route;
      const iconMap = {
        Dashboard: 'mdi-view-dashboard',
        RealEstate: 'mdi-home-city',
        Rentals: 'mdi-key-variant',
        Mortgages: 'mdi-bank',
      };
      const routeName = typeof route.name === 'string' ? route.name : '';
      if (routeName === 'Dashboard' || routeName === 'RealEstate' || routeName === 'Rentals' || routeName === 'Mortgages') {
        return iconMap[routeName];
      }
      return 'mdi-home-city';
    }
  },
  async mounted() {
    await this.profileStore.fetchProfile();
  },
  methods: {
    logout() {
      const auth = useAuthStore();
      auth.logout();
      this.$router.push("/login");
    },
    closeMobileDrawer() {
      // Cerrar drawer en móvil después de la navegación
      if (this.$vuetify.display.mobile) {
        this.drawer = false;
      }
    }
  }
});
</script>

<style scoped>
/* Anular la opacidad del breadcrumb deshabilitado */
:deep(.v-breadcrumbs-item--disabled) {
  opacity: 1 !important;
}
</style>