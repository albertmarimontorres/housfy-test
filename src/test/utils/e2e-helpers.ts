import type { Page } from '@playwright/test';

/**
 * Configuración global y utilidades para tests E2E
 */
export class E2EHelpers {
  
  /**
   * URLs base de la aplicación
   */
  static readonly URLS = {
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/app/dashboard',
    REAL_ESTATE: '/app/real-estate',
    RENTALS: '/app/rentals',
    MORTGAGES: '/app/mortgages'
  } as const;

  /**
   * Selectores comunes de la aplicación
   */
  static readonly SELECTORS = {
    // Auth
    EMAIL_INPUT: 'input[type="email"]',
    PASSWORD_INPUT: 'input[type="password"]',
    SUBMIT_BUTTON: 'button[type="submit"]',
    
    // Navigation
    USER_MENU: '[data-testid="user-menu"]',
    LOGOUT_BUTTON: '[data-testid="logout-btn"]',
    
    // Feedback
    SNACKBAR: '.v-snackbar',
    LOADING_SPINNER: '.v-progress-circular',
    
    // Layout
    SIDEBAR: '.v-navigation-drawer',
    APP_BAR: '.v-app-bar',
    MAIN_CONTENT: '.v-main'
  } as const;

  /**
   * Tiempos de espera comunes
   */
  static readonly TIMEOUTS = {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 10000,
    API_RESPONSE: 5000,
    NAVIGATION: 5000
  } as const;

  /**
   * Configuraciones de viewport para diferentes dispositivos
   */
  static readonly VIEWPORTS = {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1440, height: 900 },
    LARGE_DESKTOP: { width: 1920, height: 1080 }
  } as const;

  /**
   * Espera a que desaparezcan todos los indicadores de carga
   */
  static async waitForLoadingToFinish(page: Page, timeout = E2EHelpers.TIMEOUTS.MEDIUM) {
    await page.locator(E2EHelpers.SELECTORS.LOADING_SPINNER).waitFor({ 
      state: 'hidden', 
      timeout 
    }).catch(() => {
      // Si no hay spinner, continuar
    });
  }

  /**
   * Espera a que la navegación se complete y la página esté completamente cargada
   */
  static async waitForPageLoad(page: Page, expectedUrl?: string | RegExp) {
    await page.waitForLoadState('networkidle');
    
    if (expectedUrl) {
      if (typeof expectedUrl === 'string') {
        await page.waitForURL(expectedUrl, { timeout: E2EHelpers.TIMEOUTS.NAVIGATION });
      } else {
        await page.waitForURL(expectedUrl, { timeout: E2EHelpers.TIMEOUTS.NAVIGATION });
      }
    }
    
    await E2EHelpers.waitForLoadingToFinish(page);
  }

  /**
   * Toma una captura de pantalla con timestamp
   */
  static async takeScreenshot(page: Page, name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Simula la carga lenta de la aplicación
   */
  static async simulateSlowNetwork(page: Page) {
    await page.route('**/*', (route) => {
      setTimeout(() => route.continue(), 1000);
    });
  }

  /**
   * Limpia todos los datos del navegador
   */
  static async clearBrowserData(page: Page) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Limpiar cookies
    const context = page.context();
    await context.clearCookies();
  }

  /**
   * Verifica que no hay errores de consola JavaScript
   */
  static async verifyNoConsoleErrors(page: Page, allowedErrors: string[] = []) {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        const isAllowedError = allowedErrors.some(allowed => 
          errorText.includes(allowed)
        );
        
        if (!isAllowedError) {
          errors.push(errorText);
        }
      }
    });
    
    // Retornar función para verificar al final del test
    return () => {
      if (errors.length > 0) {
        throw new Error(`Console errors detected: ${errors.join(', ')}`);
      }
    };
  }

  /**
   * Intercepta todas las llamadas API y registra para debugging
   */
  static async enableAPILogging(page: Page) {
    await page.route('**/api/**', (route) => {
      console.log(`API Call: ${route.request().method()} ${route.request().url()}`);
      route.continue();
    });
  }

  /**
   * Espera a que un elemento sea clickeable
   */
  static async waitForClickable(page: Page, selector: string, timeout = E2EHelpers.TIMEOUTS.MEDIUM) {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    await element.waitFor({ state: 'attached', timeout });
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && !el.hasAttribute('disabled') && 
               getComputedStyle(el).pointerEvents !== 'none';
      },
      selector,
      { timeout }
    );
  }

  /**
   * Scroll hasta un elemento y espera a que sea visible
   */
  static async scrollToElement(page: Page, selector: string) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.locator(selector).waitFor({ state: 'visible' });
  }

  /**
   * Tipos de datos de test comunes
   */
  static readonly TEST_DATA = {
    VALID_EMAIL: 'test@example.com',
    INVALID_EMAIL: 'email-invalid',
    STRONG_PASSWORD: 'StrongPass123!',
    WEAK_PASSWORD: '123',
    LONG_TEXT: 'Lorem ipsum '.repeat(100),
    SPECIAL_CHARS: '!@#$%^&*()_+-={}[]|\\:";\'<>?,./'
  } as const;

  /**
   * Genera datos aleatorios para tests
   */
  static generateTestData() {
    const timestamp = Date.now();
    return {
      email: `test${timestamp}@example.com`,
      name: `Test User ${timestamp}`,
      password: `TestPass${timestamp}`,
      uuid: `test-${timestamp}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Mock para respuestas de API comunes
   */
  static readonly API_MOCKS = {
    SUCCESS_RESPONSE: {
      success: true,
      message: 'Operation completed successfully'
    },
    ERROR_RESPONSE: {
      success: false,
      message: 'An error occurred'
    },
    AUTH_SUCCESS: {
      success: true,
      bearer: 'fake-jwt-token',
      message: 'Authentication successful'
    },
    AUTH_ERROR: {
      success: false,
      message: 'Invalid credentials'
    }
  } as const;

  /**
   * Aplica configuración de accesibilidad para tests
   */
  static async enableAccessibilityMode(page: Page) {
    await page.addInitScript(() => {
      // Habilitar modo de alto contraste
      document.documentElement.style.filter = 'contrast(1.2)';
      
      // Reducir animaciones
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: 0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    });
  }
}