// src/router/guards.ts

import { useAuthStore } from "@/stores/auth.store";

export function authGuard(to: any, from: any, next: any) {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    return next("/login");
  }

  next();
}
