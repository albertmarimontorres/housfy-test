import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directorio de tests E2E
  testDir: './src/test/features',
  
  // Patrón para encontrar tests E2E
  testMatch: '**/e2e/**/*.e2e.test.ts',
  
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  
  /* Fallar el build si dejas test.only en el código */
  forbidOnly: !!process.env.CI,
  
  /* Reintentar en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out de parallel tests en CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reportes */
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  
  /* Configuración global para todos los tests */
  use: {
    /* URL base para usar en los tests con page.goto('/') */
    baseURL: 'http://localhost:3000',
    
    /* Capturar trazas en fallos */
    trace: 'on-first-retry',
    
    /* Capturar screenshots en fallos */
    screenshot: 'only-on-failure',
    
    /* Grabar videos en fallos */
    video: 'retain-on-failure',
  },

  /* Configurar proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Tests en dispositivos móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Ejecutar servidor de desarrollo antes de empezar tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para que el servidor arranque
  },
})