import { test, expect } from '@playwright/test';

test.describe('Register E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('debe mostrar la página de registro correctamente', async ({ page }) => {
    // Verificar elementos principales del formulario de registro
    await expect(page.locator('h2')).toContainText('Crea tu cuenta');

    // Verificar campos del formulario (ajustar según implementación real)
    const nameField = page.locator('input[type="text"]').first();
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]').first();
    const registerButton = page.locator('button[type="submit"]');

    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(registerButton).toBeVisible();

    // Verificar enlace a login
    const loginLink = page
      .locator('text=¿Ya tienes cuenta?')
      .or(page.locator('a[href*="login"]'))
      .first();
    await expect(loginLink).toBeVisible();
  });

  test('debe registrar usuario exitosamente', async ({ page }) => {
    // Mock API de registro exitoso
    await page.route('**/register', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bearer: 'new-user-token-123',
          message: 'Registro exitoso',
        }),
      });
    });

    // Llenar formulario (ajustar selectores según implementación)
    await page.locator('input[type="text"]').first().fill('Nuevo Usuario');
    await page.locator('input[type="email"]').fill('nuevo@example.com');
    await page.locator('input[type="password"]').first().fill('Password123!'); // Password que cumple todos los requisitos

    // Si hay confirmación de password
    const confirmPasswordField = page.locator('input[type="password"]').nth(1);
    if (await confirmPasswordField.isVisible({ timeout: 1000 })) {
      await confirmPasswordField.fill('Password123!'); // Usar mismo password que cumple requisitos
    }

    // Enviar formulario
    await page.locator('button[type="submit"]').click();

    // Verificar redirección al dashboard
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 5000 });
  });

  test('debe manejar errores de registro', async ({ page }) => {
    // Mock API con error
    await page.route('**/register', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'El email ya está registrado',
        }),
      });
    });

    // Llenar formulario
    await page.locator('input[type="text"]').first().fill('Usuario Test');
    await page.locator('input[type="email"]').fill('existente@example.com');
    await page.locator('input[type="password"]').first().fill('Password123!'); // Password que cumple requisitos

    // Enviar formulario
    await page.locator('button[type="submit"]').click();

    // Verificar mensaje de error
    await expect(page.locator('.v-snackbar')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.v-snackbar')).toContainText('El email ya está registrado');

    // Verificar que permanece en registro
    await expect(page).toHaveURL(/\/register/);
  });

  test('debe navegar a login desde registro', async ({ page }) => {
    // Buscar enlace a login
    const loginLink = page
      .locator('text=¿Ya tienes cuenta?')
      .or(page.locator('text=Iniciar sesión'))
      .or(page.locator('a[href*="login"]'))
      .first();

    await loginLink.click();

    // Verificar redirección
    await expect(page).toHaveURL(/\/login/);

    // Verificar que estamos en la página de login
    await expect(page.locator('h2')).toContainText('Haz login en la plataforma');
  });
});
