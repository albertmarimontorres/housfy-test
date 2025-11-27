// Ya que la prueba es solo FE, almacenamos el token en localStorage
// Si se añade un backend, usar cookie HttpOnly + sameSite=Strict para mayor seguridad.
// * Nota: no soluciona XSS, pero reduce vectores y centraliza la lógica.

const TOKEN_KEY = "auth_token_v1"; // versionado por si cambias el formato
const EXPIRES_KEY = "auth_expires_v1";
const OBFUSCATION_PREFIX = "hf_"; // Genero ruido para evitar lectura normal

export const tokenStorage = {
  set(token: string, expiresInSeconds: number = 3600) {
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    // Obfuscación simple (NO seguridad real)
    const encoded = btoa(OBFUSCATION_PREFIX + token);

    localStorage.setItem(TOKEN_KEY, encoded);
    localStorage.setItem(EXPIRES_KEY, expiresAt.toString());
  },

  get(): string | null {
    try {
      const encoded = localStorage.getItem(TOKEN_KEY);
      const expiresAt = Number(localStorage.getItem(EXPIRES_KEY));

      if (!encoded || !expiresAt) return null;

      if (Date.now() > expiresAt) {
        this.clear();
        return null;
      }

      const decoded = atob(encoded);

      // Validación del prefijo
      if (!decoded.startsWith(OBFUSCATION_PREFIX)) return null;

      return decoded.replace(OBFUSCATION_PREFIX, "");
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }
};
