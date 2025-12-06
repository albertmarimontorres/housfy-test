<template>
  <v-app>
    <!-- Navigation Drawer - Hidden on mobile -->
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
            <v-icon>mdi-view-dashboard-outline</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item to="/app/real-estate" router @click="closeMobileDrawer">
          <template #prepend>
            <v-icon>mdi-home-outline</v-icon>
          </template>
          <v-list-item-title>Compraventa</v-list-item-title>
        </v-list-item>
        <v-list-item to="/app/rentals" router @click="closeMobileDrawer">
          <template #prepend>
            <v-icon>mdi-home-variant-outline</v-icon>
          </template>
          <v-list-item-title>Alquileres</v-list-item-title>
        </v-list-item>
        <v-list-item to="/app/mortgages" router @click="closeMobileDrawer">
          <template #prepend>
            <v-icon>mdi-bank-outline</v-icon>
          </template>
          <v-list-item-title>Hipotecas</v-list-item-title>
        </v-list-item>
        
        <!-- Logout in mobile menu -->
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
            <!-- Mobile hamburger menu -->
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
            <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
          </div>
          
          <!-- Logout button - only visible on desktop -->
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
      drawer: true, // Controls drawer visibility
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
    pageIcon() {
      const route = this.$route;
      const iconMap = {
        Dashboard: 'mdi-view-dashboard-outline',
        RealEstate: 'mdi-home-outline',
        Rentals: 'mdi-home-variant-outline',
        Mortgages: 'mdi-bank-outline',
      };
      const routeName = typeof route.name === 'string' ? route.name : '';
      if (routeName === 'Dashboard' || routeName === 'RealEstate' || routeName === 'Rentals' || routeName === 'Mortgages') {
        return iconMap[routeName];
      }
      return 'mdi-home-outline';
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
      // Close drawer on mobile after navigation
      if (this.$vuetify.display.mobile) {
        this.drawer = false;
      }
    }
  }
});
</script>