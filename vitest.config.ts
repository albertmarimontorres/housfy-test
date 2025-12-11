/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup/vitest.minimal.ts'],
    // Include patterns for the new structure - excluir explícitamente E2E tests
    include: [
      'src/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/test/features/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/test/environment.test.ts'
    ],
    // Exclude the old test files and ALL Playwright E2E tests
    exclude: [
      'src/test/chat*.test.ts',
      'src/test/ChatWidget*.test.ts',
      'src/test/chatbot*.test.ts',
      'src/test/**/e2e/**/*', // Excluir completamente el directorio e2e
      'src/test/e2e/**/*', // Excluir directorio e2e en raíz de test también
      '**/*.e2e.test.ts', // Excluir todos los archivos .e2e.test.ts
      'node_modules/**',
      'dist/**'
    ]
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})