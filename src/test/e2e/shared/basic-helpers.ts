import type { Page } from '@playwright/test';

/**
 * Utilidades optimizadas para tests E2E básicos
 */
export class BasicE2EHelpers {
  /**
   * Datos de usuario de prueba
   */
  static readonly TEST_USER = {
    email: 'user@demo.com',
    password: 'demo123456',
  };

  /**
   * Mock optimizado de autenticación que se puede reutilizar
   */
  static async setupAuthMock(page: Page): Promise<void> {
    await page.route('**/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bearer: 'mock-jwt-token-e2e',
          message: 'Login exitoso',
        }),
      });
    });
  }

  /**
   * Proceso de login optimizado
   */
  static async performLogin(page: Page): Promise<void> {
    await page.goto('/login');

    // Rellenar formulario de forma más eficiente
    await Promise.all([
      page.fill('input[type="email"]', this.TEST_USER.email),
      page.fill('input[type="password"]', this.TEST_USER.password),
    ]);

    // Hacer click y esperar navegación
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForURL(/.*\/app\/dashboard.*/),
    ]);
  }

  /**
   * Verificación básica de página cargada
   */
  static async verifyBasicPageLoad(page: Page, expectedUrl: string): Promise<void> {
    // Verificar URL
    await page.waitForURL(new RegExp(`.*${expectedUrl}.*`));

    // Verificar que hay un título/encabezado
    await page.waitForSelector('h1, h2, [data-testid*="title"], [data-testid*="heading"]', {
      state: 'visible',
      timeout: 5000,
    });

    // Verificar que la página terminó de cargar
    await page.waitForLoadState('networkidle');
  }

  /**
   * Verificar que no hay errores visibles en la página
   */
  static async verifyNoErrors(page: Page): Promise<void> {
    const errorSelectors = [
      '[data-testid*="error"]',
      '.error',
      '[class*="error"]',
      '.v-alert--type-error',
    ];

    for (const selector of errorSelectors) {
      const errorElements = page.locator(selector);
      const count = await errorElements.count();
      if (count > 0) {
        const errorText = await errorElements.first().textContent();
        throw new Error(`Error encontrado en página: ${errorText}`);
      }
    }
  }

  /**
   * Verificar navegación básica
   */
  static async verifyNavigation(page: Page, currentPath: string): Promise<void> {
    // Verificar URL actual
    const currentUrl = page.url();
    if (!currentUrl.includes(currentPath)) {
      throw new Error(`Expected URL to contain ${currentPath}, got ${currentUrl}`);
    }

    // Ir al dashboard y volver
    await page.goto('/app/dashboard');
    await page.waitForURL(/.*\/app\/dashboard.*/);

    await page.goto(currentPath);
    await page.waitForURL(new RegExp(`.*${currentPath.replace('/', '\\/')}.*`));
  }

  /**
   * Verificar que hay elementos interactivos en la página
   */
  static async verifyInteractiveElements(page: Page): Promise<void> {
    const interactiveSelectors = [
      'button:visible',
      'a[href]:visible',
      '[role="button"]:visible',
      '.v-btn:visible',
    ];

    let foundInteractive = false;
    for (const selector of interactiveSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        foundInteractive = true;
        break;
      }
    }

    if (!foundInteractive) {
      throw new Error('No se encontraron elementos interactivos en la página');
    }
  }

  /**
   * Configurar mocks de datos básicos para cualquier endpoint
   */
  static async setupDataMock(
    page: Page,
    endpoint: string,
    dataKey: string,
    mockData: any[]
  ): Promise<void> {
    await page.route(`**/${endpoint}**`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: `${dataKey} obtenidos exitosamente`,
          [dataKey]: mockData,
        }),
      });
    });
  }

  /**
   * Setup completo optimizado para tests básicos
   */
  static async setupBasicE2ETest(page: Page, route: string): Promise<void> {
    // Setup auth mock
    await this.setupAuthMock(page);

    // Hacer login
    await this.performLogin(page);

    // Navegar a la ruta deseada
    await page.goto(route);

    // Verificar carga básica
    await this.verifyBasicPageLoad(page, route);
  }
}

/**
 * Datos mock reutilizables para tests básicos
 */
export const MockData = {
  mortgages: [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      bank: 'Banco Santander',
      city: 'Madrid',
      loanAmountMinUnit: 20000000,
      propertyValueMinUnit: 25000000,
      ltv: 80,
      status: 'Aprobado',
      last_status_changed_at: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
    },
  ],

  properties: [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      propertyStreet: 'Calle Mayor',
      propertyStreetNumber: 123,
      propertyFloor: 3,
      propertyCity: 'Madrid',
      propertyPriceMinUnit: 35000000,
      squareMeters: 85,
      bedrooms: 3,
      bathrooms: 2,
      status: 'En venta',
      last_status_changed_at: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
    },
  ],

  rentals: [
    {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      propertyStreet: 'Calle Serrano',
      propertyStreetNumber: 89,
      propertyFloor: 2,
      propertyCity: 'Madrid',
      propertyPriceMinUnit: 1500,
      status: 'Disponible',
      last_status_changed_at: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
};
