import { loginApi, registerApi } from "@/api/modules/auth.api";
import type { AuthCredentials, RegisterPayload, AuthResponse } from "@/types/Auth";

export const AuthService = {
  async login(payload: AuthCredentials): Promise<AuthResponse> {
    const { data } = await loginApi(payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await registerApi(payload);
    return data;
  }
};
