import { defineStore } from 'pinia';
import { getProfile } from '@/services/profile.service';
import type { User } from '@/types/Profile';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await getProfile();
        if (resp && resp.user) {
          this.user = resp.user;
        } else {
          this.user = null;
          this.error = resp?.message || 'No se pudo obtener el perfil';
        }
      } catch (e: any) {
        this.user = null;
        this.error = e?.response?.data?.message || 'Error al obtener el perfil';
      } finally {
        this.loading = false;
      }
    },
    clearProfile() {
      this.user = null;
      this.error = null;
    },
  },
});
