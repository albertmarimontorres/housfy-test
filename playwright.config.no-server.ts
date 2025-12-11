import { defineConfig, devices } from '@playwright/test'

/**
 * Configuración de Playwright para tests sin servidor de desarrollo
 * Útil para CI/CD o cuando el servidor ya está ejecutándose
 */
export default defineConfig({
  // Directorio de tests E2E
  testDir: './src/test/e2e',
  
  // Patrón para encontrar tests E2E
  testMatch: '**/*.e2e.test.ts',
  
  /* Directorio de salida - evitar conflictos de permisos */
  outputDir: './test-results-clean',
  
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
    ['line'],
    ['json', { outputFile: 'playwright-report-clean/results.json' }]
  ],
  
  /* Configuración global para todos los tests */
  use: {
    /* URL base para usar en los tests con page.goto('/') */
    baseURL: 'http://localhost:5175', // Puerto actual del servidor de desarrollo
    
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
    }
  ],

  /* NO iniciar servidor automáticamente - asumir que ya está ejecutándose */
  // webServer: deshabilitado para evitar conflictos
});