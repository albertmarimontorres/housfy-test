import type { Page } from '@playwright/test';

/**
 * Utilidades para tests E2E de autenticación
 */
export class AuthE2EHelpers {
  
  /**
   * Datos de prueba para tests de login
   */
  static readonly TEST_USERS = {
    valid: {
      email: 'user@demo.com',
      password: 'demo123456' // 11 characters - válido para pasar la validación
    },
    invalid: {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    },
    invalidFormat: {
      email: 'email-sin-arroba',
      password: 'password123'
    }
  };

  /**
   * Intercepta llamadas a la API de login y devuelve respuesta mockeada
   */
  static async mockLoginAPI(page: Page, success: boolean, options?: {
    token?: string;
    message?: string;
    delay?: number;
  }) {
    const { token = 'fake-jwt-token', message, delay = 0 } = options || {};
    
    await page.route('**/login', route => {
      const responseBody = success ? {
        success: true,
        bearer: token,
        message: message || 'Login exitoso'
      } : {
        success: false,
        message: message || 'Credenciales inválidas'
      };

      if (delay > 0) {
        setTimeout(() => {
          route.fulfill({
            status: success ? 200 : 401,
            contentType: 'application/json',
            body: JSON.stringify(responseBody)
          });
        }, delay);
      } else {
        route.fulfill({
          status: success ? 200 : 401,
          contentType: 'application/json',
          body: JSON.stringify(responseBody)
        });
      }
    });
  }

  /**
   * Llena el formulario de login con credenciales
   */
  static async fillLoginForm(page: Page, credentials: { email: string; password: string }) {
    await page.locator('input[type="email"]').fill(credentials.email);
    await page.locator('input[type="password"]').fill(credentials.password);
  }

  /**
   * Envía el formulario de login
   */
  static async submitLoginForm(page: Page) {
    await page.locator('button[type="submit"]').click();
  }

  /**
   * Realiza login completo (llenar + enviar)
   */
  static async performLogin(page: Page, credentials: { email: string; password: string }) {
    await this.fillLoginForm(page, credentials);
    await this.submitLoginForm(page);
  }

  /**
   * Verifica que el snackbar muestra el mensaje esperado
   */
  static async verifySnackbarMessage(page: Page, expectedMessage: string, timeout = 5000) {
    const snackbar = page.locator('.v-snackbar');
    await snackbar.waitFor({ state: 'visible', timeout });
    await page.waitForFunction(
      (message) => {
        const snackbarElement = document.querySelector('.v-snackbar');
        return snackbarElement?.textContent?.includes(message);
      },
      expectedMessage,
      { timeout }
    );
  }

  /**
   * Verifica los elementos básicos de la página de login
   */
  static async verifyLoginPageElements(page: Page) {
    // Verificar título
    await page.locator('h2:has-text("Haz login en la plataforma")').waitFor();
    
    // Verificar campos del formulario
    await page.locator('input[type="email"]').waitFor();
    await page.locator('input[type="password"]').waitFor();
    await page.locator('button[type="submit"]').waitFor();
    
    // Verificar enlace de registro
    await page.locator('text=¿No tienes cuenta? Regístrate').waitFor();
  }

  /**
   * Navega a la página de login
   */
  static async navigateToLogin(page: Page) {
    await page.goto('/login');
    await this.verifyLoginPageElements(page);
  }

  /**
   * Simula diferentes tipos de errores de red
   */
  static async mockNetworkError(page: Page, errorType: 'timeout' | 'server-error' | 'network-failure') {
    await page.route('**/login', route => {
      switch (errorType) {
        case 'timeout':
          // Simular timeout - no responder nunca
          break;
        case 'server-error':
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              message: 'Error interno del servidor'
            })
          });
          break;
        case 'network-failure':
          route.abort('failed');
          break;
      }
    });
  }

  /**
   * Verifica que el usuario está autenticado comprobando elementos de la UI privada
   */
  static async verifyUserIsAuthenticated(page: Page) {
    // Esperar un poco para que la navegación se complete
    await page.waitForTimeout(500);
    
    // Verificar que estamos en una ruta privada
    await page.waitForURL(/\/app\//, { timeout: 8000 });
    
    // Verificar elementos de la UI privada - buscar el avatar del usuario o un elemento del layout privado
    try {
      await page.locator('.v-avatar').waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Fallback: verificar que tenemos el navigation drawer (parte del layout privado)
      await page.locator('.v-navigation-drawer').waitFor({ state: 'visible', timeout: 3000 });
    }
  }

  /**
   * Limpia el almacenamiento local (tokens, etc.)
   * Maneja errores de seguridad cuando localStorage no está disponible
   */
  static async clearStorage(page: Page) {
    try {
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          // localStorage puede no estar disponible en algunos contextos
          console.warn('No se pudo limpiar localStorage:', error);
        }
      });
    } catch (error) {
      // Si no podemos acceder a la página, navegamos a una válida primero
      console.warn('Error al acceder a storage, navegando a página base:', error);
      await page.goto('/');
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (innerError) {
          console.warn('No se pudo limpiar localStorage después de navegar:', innerError);
        }
      });
    }
  }
}