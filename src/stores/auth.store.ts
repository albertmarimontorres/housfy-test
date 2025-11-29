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
        const response = await AuthService.login(payload);
        if (response.success && response.bearer) {
          tokenStorage.set(response.bearer);
          this.token = response.bearer;
        } else {
          this.error = response.message || "Error in login";
        }
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
        const response = await AuthService.register(payload);
        if (response.success && response.bearer) {
          tokenStorage.set(response.bearer);
          this.token = response.bearer;
        } else {
          this.error = response.message || "Error in register";
        }
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
