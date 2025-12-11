import { test, expect } from '@playwright/test';

test.describe('Login E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login antes de cada test
    await page.goto('/login');
  });

  test('debe mostrar la página de login correctamente', async ({ page }) => {
    // Verificar que la página carga correctamente
    await expect(page).toHaveTitle('Housfy Admin');
    
    // Verificar elementos principales del formulario de login
    await expect(page.locator('h2')).toContainText('Haz login en la plataforma');
    
    // Verificar que los campos del formulario están presentes
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Verificar que el botón inicialmente está deshabilitado
    await expect(loginButton).toBeDisabled();
    
    // Verificar enlace a registro
    await expect(page.locator('text=¿No tienes cuenta? Regístrate')).toBeVisible();
  });

  test('debe habilitar el botón de login cuando se completen los campos', async ({ page }) => {
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    // Inicialmente el botón debe estar deshabilitado
    await expect(loginButton).toBeDisabled();
    
    // Rellenar solo email
    await emailField.fill('test@example.com');
    await expect(loginButton).toBeDisabled();
    
    // Rellenar password
    await passwordField.fill('password123');
    
    // Ahora el botón debe estar habilitado
    await expect(loginButton).toBeEnabled();
  });

  test('debe mostrar estado de carga al enviar el formulario', async ({ page }) => {
    // Interceptar la llamada a la API para controlar la respuesta
    await page.route('**/login', route => {
      // Simular una respuesta lenta para ver el loading
      setTimeout(() => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Credenciales inválidas'
          })
        });
      }, 1000);
    });

    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    // Rellenar formulario
    await emailField.fill('invalid@example.com');
    await passwordField.fill('wrongpassword');
    
    // Enviar formulario
    await loginButton.click();
    
    // Verificar estado de carga
    await expect(loginButton).toHaveText('Entrar');
    await expect(loginButton).toBeDisabled();
    
    // Esperar a que termine la carga
    await expect(loginButton).toBeEnabled({ timeout: 5000 });
  });

  test('debe manejar credenciales inválidas', async ({ page }) => {
    // Interceptar llamada API para simular error de credenciales
    await page.route('**/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Credenciales inválidas'
        })
      });
    });

    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    // Rellenar con credenciales inválidas
    await emailField.fill('invalid@example.com');
    await passwordField.fill('wrongpassword');
    
    // Enviar formulario
    await loginButton.click();
    
    // Verificar que se muestra mensaje de error (snackbar)
    await expect(page.locator('.v-snackbar')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.v-snackbar')).toContainText('Credenciales inválidas');
    
    // Verificar que permanece en la página de login
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe redirigir al dashboard tras login exitoso', async ({ page }) => {
    // Interceptar llamada API para simular login exitoso
    await page.route('**/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bearer: 'fake-jwt-token',
          message: 'Login exitoso'
        })
      });
    });

    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    // Rellenar con credenciales válidas
    await emailField.fill('user@demo.com');
    await passwordField.fill('demo123456'); // Usar password válido de 8+ caracteres
    
    // Enviar formulario
    await loginButton.click();
    
    // Verificar redirección al dashboard
    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 5000 });
    
    // Verificar mensaje de bienvenida
    await expect(page.locator('.v-snackbar')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.v-snackbar')).toContainText('¡Bienvenido!');
  });

  test('debe navegar a la página de registro', async ({ page }) => {
    // Hacer clic en el enlace de registro
    await page.click('text=¿No tienes cuenta? Regístrate');
    
    // Verificar redirección a la página de registro
    await expect(page).toHaveURL(/\/register/);
  });

  test('debe validar formato de email', async ({ page }) => {
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    // Probar email inválido
    await emailField.fill('email-invalido');
    await passwordField.fill('password123');
    
    // El botón debería seguir habilitado (la validación de formato es del navegador)
    await expect(loginButton).toBeEnabled();
    
    // Al intentar enviar, el navegador debería mostrar error de validación HTML5
    await loginButton.click();
    
    // Verificar que sigue en la misma página debido a validación HTML5
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe funcionar en dispositivo móvil', async ({ browser }) => {
    // Crear contexto con soporte táctil
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    
    await page.goto('/login');
    
    // Verificar que los elementos son visibles y accesibles en móvil
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Probar interacción táctil
    await emailField.tap();
    await emailField.fill('mobile@test.com');
    
    await passwordField.tap();
    await passwordField.fill('password123456'); // Usar password válido
    
    await expect(loginButton).toBeEnabled();
    
    // Cerrar contexto
    await context.close();
  });
});