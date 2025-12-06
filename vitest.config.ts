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
    // Include patterns for the new structure
    include: [
      'src/test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/test/features/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/test/environment.test.ts'
    ],
    // Exclude the old test files and Playwright E2E tests
    exclude: [
      'src/test/chat*.test.ts',
      'src/test/ChatWidget*.test.ts',
      'src/test/chatbot*.test.ts',
      'src/test/**/e2e/**/*.playwright.test.ts', // Exclude Playwright E2E tests
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