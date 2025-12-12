import { test, expect } from '@playwright/test';
import { AuthE2EHelpers } from './auth-helpers';

test.describe('Login E2E Tests - Avanzados', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a login primero para tener un contexto válido
    await AuthE2EHelpers.navigateToLogin(page);
    // Luego limpiar almacenamiento
    await AuthE2EHelpers.clearStorage(page);
  });

  test('flujo completo de login exitoso con credenciales válidas', async ({ page }) => {
    // Configurar mock para login exitoso
    await AuthE2EHelpers.mockLoginAPI(page, true, {
      message: '¡Bienvenido de vuelta!',
      token: 'valid-jwt-token-123',
    });

    // Realizar login
    await AuthE2EHelpers.performLogin(page, AuthE2EHelpers.TEST_USERS.valid);

    // Verificar mensaje de éxito
    await AuthE2EHelpers.verifySnackbarMessage(page, '¡Bienvenido!');

    // Verificar redirección y autenticación
    await AuthE2EHelpers.verifyUserIsAuthenticated(page);
  });

  test('manejo de errores de red - timeout', async ({ page }) => {
    // Simular timeout de red
    await AuthE2EHelpers.mockNetworkError(page, 'timeout');

    await AuthE2EHelpers.fillLoginForm(page, AuthE2EHelpers.TEST_USERS.valid);

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verificar que el botón permanece en estado de carga por un tiempo
    await expect(submitButton).toBeDisabled();

    // En un caso real, habría un timeout que mostraría error
    // Por ahora verificamos que el estado de carga se mantiene
    await page.waitForTimeout(2000);
    await expect(submitButton).toBeDisabled();
  });

  test('manejo de errores de servidor (500)', async ({ page }) => {
    // Simular error de servidor
    await AuthE2EHelpers.mockNetworkError(page, 'server-error');

    await AuthE2EHelpers.performLogin(page, AuthE2EHelpers.TEST_USERS.valid);

    // Verificar mensaje de error del servidor
    await AuthE2EHelpers.verifySnackbarMessage(page, 'Error interno del servidor');

    // Verificar que permanece en login
    await expect(page).toHaveURL(/\/login/);
  });

  test('persistencia de estado - recargar página mantiene autenticación', async ({ page }) => {
    // Login exitoso
    await AuthE2EHelpers.mockLoginAPI(page, true);
    await AuthE2EHelpers.performLogin(page, AuthE2EHelpers.TEST_USERS.valid);

    // Verificar redirección inicial
    await expect(page).toHaveURL(/\/app\/dashboard/);

    // Recargar página
    await page.reload();

    // Verificar que sigue autenticado (no redirige a login)
    await expect(page).toHaveURL(/\/app\/dashboard/);
  });

  test('logout y redirección a login', async ({ page }) => {
    // Primero hacer login
    await AuthE2EHelpers.mockLoginAPI(page, true);
    await AuthE2EHelpers.performLogin(page, AuthE2EHelpers.TEST_USERS.valid);
    await AuthE2EHelpers.verifyUserIsAuthenticated(page);

    // Buscar y hacer clic en botón de logout (ajustar selector según tu implementación)
    const logoutButton = page
      .locator('[data-testid="logout-btn"]')
      .or(page.locator('text=Cerrar sesión'))
      .or(page.locator('text=Logout'))
      .first();

    if (await logoutButton.isVisible({ timeout: 2000 })) {
      await logoutButton.click();

      // Verificar redirección a login
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    } else {
      // Si no hay botón de logout visible, simular limpieza de token
      await AuthE2EHelpers.clearStorage(page);
      await page.goto('/app/dashboard');

      // Debería redirigir a login debido al guard
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    }
  });

  test('validación de campos vacíos', async ({ page }) => {
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Verificar estado inicial (botón deshabilitado)
    await expect(submitButton).toBeDisabled();

    // Solo email
    await emailField.fill('test@example.com');
    await expect(submitButton).toBeDisabled();

    // Limpiar email, solo password
    await emailField.clear();
    await passwordField.fill('password123');
    await expect(submitButton).toBeDisabled();

    // Ambos campos llenos
    await emailField.fill('test@example.com');
    await expect(submitButton).toBeEnabled();

    // Limpiar uno de los campos
    await passwordField.clear();
    await expect(submitButton).toBeDisabled();
  });

  test('navegación entre login y registro', async ({ page }) => {
    // Verificar que estamos en login
    await expect(page).toHaveURL(/\/login/);

    // Ir a registro
    await page.click('text=¿No tienes cuenta? Regístrate');
    await expect(page).toHaveURL(/\/register/);

    // Volver a login (asumiendo que hay un enlace en registro)
    const loginLink = page
      .locator('text=¿Ya tienes cuenta?')
      .or(page.locator('text=Iniciar sesión'))
      .or(page.locator('a[href*="login"]'))
      .first();

    if (await loginLink.isVisible({ timeout: 2000 })) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('accesibilidad - navegación por teclado', async ({ page }) => {
    // Verificar que se puede navegar por teclado
    await page.keyboard.press('Tab'); // Email field
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Password field
    await expect(page.locator('input[type="password"]')).toBeFocused();

    // No intentar hacer foco en el botón deshabilitado, en su lugar llenar el formulario primero
    await page.keyboard.press('Shift+Tab'); // Volver a email

    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('password123456'); // Usar password válido

    // Ahora que el formulario está lleno, el botón debería estar habilitado
    await expect(page.locator('button[type="submit"]')).toBeEnabled();

    // Ahora sí podemos navegar al botón
    await page.keyboard.press('Tab'); // Submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused();

    // Enviar con Enter
    await page.keyboard.press('Enter');
  });

  test('validación de límites de caracteres', async ({ page }) => {
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');

    // Email muy largo
    const longEmail = `${'a'.repeat(300)}@example.com`;
    await emailField.fill(longEmail);

    // Password muy largo
    const longPassword = 'p'.repeat(1000);
    await passwordField.fill(longPassword);

    // Verificar que los valores se mantienen (sin restricciones específicas por ahora)
    await expect(emailField).toHaveValue(longEmail);
    await expect(passwordField).toHaveValue(longPassword);
  });
});
