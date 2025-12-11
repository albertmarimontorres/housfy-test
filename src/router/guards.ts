import { useAuthStore } from "@/stores/auth.store";

export function authGuard(_to: any, _from: any, next: any) {
  const auth = useAuthStore();

  if (!auth.isAuthenticated) {
    return next("/login");
  }

  next();
}
