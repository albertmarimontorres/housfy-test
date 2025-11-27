import { defineStore } from "pinia";
import { AuthService } from "@/services/auth.service";
import { tokenStorage } from "@/utils/tokenStorage";
import type { AuthCredentials, RegisterPayload } from "@/types/Auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: tokenStorage.get() as string | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(payload: AuthCredentials) {
      this.loading = true;
      this.error = null;

      try {
        const { token } = await AuthService.login(payload);
        tokenStorage.set(token);
        this.token = token;
      } catch (err: any) {
        this.error = err?.response?.data?.message ?? "Error in login";
      } finally {
        this.loading = false;
      }
    },

    async register(payload: RegisterPayload) {
      this.loading = true;
      this.error = null;

      try {
        const { token } = await AuthService.register(payload);
        tokenStorage.set(token);
        this.token = token;
      } catch (err: any) {
        this.error = err?.response?.data?.message ?? "Error in register";
      } finally {
        this.loading = false;
      }
    },

    logout() {
      tokenStorage.clear();
      this.token = null;
    }
  }
});
