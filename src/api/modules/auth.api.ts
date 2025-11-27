import http from "@/api/httpClient";
import { type AuthCredentials, type RegisterPayload } from "@/types/Auth";

export const loginApi = (data: AuthCredentials) =>
  http.post("/login", data);

export const registerApi = (data: RegisterPayload) =>
  http.post("/register", data);
