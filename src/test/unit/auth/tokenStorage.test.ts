import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('tokenStorage Tests', () => {
  let tokenStorage: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    vi.stubGlobal('localStorage', mockLocalStorage);

    // Mock Date.now para tests deterministas
    vi.spyOn(Date, 'now').mockReturnValue(1000000); // timestamp fijo

    // Mock btoa/atob con implementación simple
    vi.stubGlobal('btoa', (str: string) => {
      // Implementación simple para testing
      return str
        .split('')
        .map(c => c.charCodeAt(0).toString(16))
        .join('');
    });

    vi.stubGlobal('atob', (str: string) => {
      try {
        // Implementación simple para testing - reversa de btoa
        const chars = str.match(/.{1,2}/g) || [];
        return chars.map(c => String.fromCharCode(parseInt(c, 16))).join('');
      } catch {
        throw new Error('Invalid base64');
      }
    });

    // Re-import tokenStorage para cada test
    vi.resetModules();
    const module = await import('@/utils/tokenStorage');
    tokenStorage = module.tokenStorage;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('set method', () => {
    it('debería almacenar token con expiración por defecto (3600s)', () => {
      // Arrange
      const testToken = 'test-jwt-token';
      const expectedExpiresAt = 1000000 + 3600 * 1000; // 1 hora después
      const expectedEncoded = btoa(`hf_${testToken}`);

      // Act
      tokenStorage.set(testToken);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token_v1', expectedEncoded);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_expires_v1',
        expectedExpiresAt.toString()
      );
      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('debería almacenar token con expiración personalizada', () => {
      // Arrange
      const testToken = 'test-jwt-token';
      const customExpiry = 7200; // 2 horas
      const expectedExpiresAt = 1000000 + customExpiry * 1000;
      const expectedEncoded = btoa(`hf_${testToken}`);

      // Act
      tokenStorage.set(testToken, customExpiry);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token_v1', expectedEncoded);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth_expires_v1',
        expectedExpiresAt.toString()
      );
    });

    it('debería codificar el token con prefijo de obfuscación', () => {
      // Arrange
      const testToken = 'my-secret-token';
      const expectedPrefixedToken = `hf_${testToken}`;
      const expectedEncoded = btoa(expectedPrefixedToken);

      // Act
      tokenStorage.set(testToken);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token_v1', expectedEncoded);
    });
  });

  describe('get method', () => {
    it('debería retornar token válido no expirado', () => {
      // Arrange
      const originalToken = 'valid-token';
      const encodedToken = btoa(`hf_${originalToken}`);
      const futureExpiry = (1000000 + 3600 * 1000).toString(); // 1 hora en el futuro

      (localStorage.getItem as any)
        .mockReturnValueOnce(encodedToken) // TOKEN_KEY
        .mockReturnValueOnce(futureExpiry); // EXPIRES_KEY

      // Act
      const result = tokenStorage.get();

      // Assert
      expect(result).toBe(originalToken);
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token_v1');
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_expires_v1');
    });

    it('debería retornar null si no hay token almacenado', () => {
      // Arrange
      (localStorage.getItem as any).mockReturnValue(null);

      // Act
      const result = tokenStorage.get();

      // Assert
      expect(result).toBe(null);
    });

    it('debería retornar null si no hay fecha de expiración', () => {
      // Arrange
      const encodedToken = btoa('hf_some-token');
      (localStorage.getItem as any)
        .mockReturnValueOnce(encodedToken) // TOKEN_KEY
        .mockReturnValueOnce(null); // EXPIRES_KEY

      // Act
      const result = tokenStorage.get();

      // Assert
      expect(result).toBe(null);
    });

    it('debería limpiar y retornar null si el token ha expirado', () => {
      // Arrange
      const encodedToken = btoa('hf_expired-token');
      const pastExpiry = (1000000 - 3600 * 1000).toString(); // 1 hora en el pasado

      (localStorage.getItem as any)
        .mockReturnValueOnce(encodedToken) // TOKEN_KEY
        .mockReturnValueOnce(pastExpiry); // EXPIRES_KEY

      const clearSpy = vi.spyOn(tokenStorage, 'clear');

      // Act
      const result = tokenStorage.get();

      // Assert
      expect(result).toBe(null);
      expect(clearSpy).toHaveBeenCalled();
    });

    it('debería retornar null si el token no tiene el prefijo correcto', () => {
      // Arrange
      const invalidToken = btoa('wrong_prefix_token'); // Sin 'hf_'
      const futureExpiry = (1000000 + 3600 * 1000).toString();

      (localStorage.getItem as any)
        .mockReturnValueOnce(invalidToken) // TOKEN_KEY
        .mockReturnValueOnce(futureExpiry); // EXPIRES_KEY

      // Act
      const result = tokenStorage.get();

      // Assert
      expect(result).toBe(null);
    });

    it('debería manejar errores de decodificación y retornar null', () => {
      // Arrange
      const malformedToken = 'not-base64!@#$';
      const futureExpiry = (1000000 + 3600 * 1000).toString();

      (localStorage.getItem as any)
        .mockReturnValueOnce(malformedToken) // TOKEN_KEY inválido
        .mockReturnValueOnce(futureExpiry); // EXPIRES_KEY

      // Mock atob para lanzar error
      vi.stubGlobal('atob', () => {
        throw new Error('Invalid base64');
      });

      // Act
      const result = tokenStorage.get();

      // Assert
      expect(result).toBe(null);
    });

    it('debería manejar fecha de expiración inválida', () => {
      // Arrange
      const encodedToken = btoa('hf_some-token');
      const invalidExpiry = 'not-a-number';

      (localStorage.getItem as any)
        .mockReturnValueOnce(encodedToken) // TOKEN_KEY
        .mockReturnValueOnce(invalidExpiry); // EXPIRES_KEY inválido

      // Act
      const result = tokenStorage.get();

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('clear method', () => {
    it('debería eliminar token y fecha de expiración', () => {
      // Act
      tokenStorage.clear();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token_v1');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_expires_v1');
      expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('integración y edge cases', () => {
    it('debería manejar ciclo completo: set -> get -> clear', () => {
      // Arrange
      const testToken = 'integration-test-token';
      const encodedToken = btoa(`hf_${testToken}`);
      const futureExpiry = (1000000 + 3600 * 1000).toString();

      // Act 1: Set token
      tokenStorage.set(testToken);

      // Act 2: Mock localStorage para get
      (localStorage.getItem as any)
        .mockReturnValueOnce(encodedToken)
        .mockReturnValueOnce(futureExpiry);

      const retrievedToken = tokenStorage.get();

      // Act 3: Clear
      tokenStorage.clear();

      // Assert
      expect(retrievedToken).toBe(testToken);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token_v1');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_expires_v1');
    });

    it('debería manejar tokens muy largos', () => {
      // Arrange
      const longToken = 'a'.repeat(1000); // Token de 1000 caracteres
      const expectedEncoded = btoa(`hf_${longToken}`);

      // Act
      tokenStorage.set(longToken);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token_v1', expectedEncoded);
    });

    it('debería manejar caracteres especiales en tokens', () => {
      // Arrange
      const specialToken = 'token-with-special-chars!@#$%^&*()_+{}|:"<>?[]\\;\'.,/`~';
      const expectedEncoded = btoa(`hf_${specialToken}`);

      // Act
      tokenStorage.set(specialToken);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token_v1', expectedEncoded);
    });

    it('debería manejar expiración en el límite exacto', () => {
      // Arrange
      const testToken = 'boundary-test-token';
      const encodedToken = btoa(`hf_${testToken}`);
      const exactExpiry = 1000000; // Mismo timestamp que Date.now()

      (localStorage.getItem as any)
        .mockReturnValueOnce(encodedToken)
        .mockReturnValueOnce(exactExpiry.toString());

      // Act
      const result = tokenStorage.get();

      // Assert - Token en el límite exacto aún debería ser válido (Date.now() === expiresAt)
      expect(result).toBe(testToken);
    });

    it('debería considerar expirado cuando Date.now() > expiresAt', () => {
      // Arrange
      const testToken = 'expired-test-token';
      const encodedToken = btoa(`hf_${testToken}`);
      const pastExpiry = 999999; // 1ms antes que Date.now() (1000000)

      (localStorage.getItem as any)
        .mockReturnValueOnce(encodedToken)
        .mockReturnValueOnce(pastExpiry.toString());

      // Act
      const result = tokenStorage.get();

      // Assert - Token expirado debería ser null y limpiar storage
      expect(result).toBe(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token_v1');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_expires_v1');
    });

    it('debería validar constantes internas', () => {
      // Este test verifica que las constantes internas se mantengan
      const testToken = 'constant-test';
      tokenStorage.set(testToken);

      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token_v1', expect.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_expires_v1', expect.any(String));
    });
  });
});
