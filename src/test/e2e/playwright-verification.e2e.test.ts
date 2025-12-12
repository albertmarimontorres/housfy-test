import { test, expect } from '@playwright/test';

// Test simple para verificar Playwright
test.describe('Test Simple de Verificación', () => {
  test('debe conectarse al servidor y cargar la página principal', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('http://localhost:5175/');

    // Verificar que la página se carga
    await expect(page).toHaveTitle(/Housfy Admin/);

    console.log('✅ Playwright está funcionando correctamente con navegadores');
    console.log('✅ Se puede conectar al servidor Vue');
    console.log('✅ Los navegadores están instalados y funcionando');
  });

  test('debe poder interactuar con elementos de la página', async ({ page }) => {
    // Navegar a la página principal
    await page.goto('http://localhost:5175/');

    // Buscar algún elemento que demuestre interactividad
    const body = await page.locator('body').first();
    await expect(body).toBeVisible();

    console.log('✅ Playwright puede interactuar con elementos DOM');
  });
});
