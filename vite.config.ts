import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        // ✅ Configuración de chunks optimizada para lazy loading
        manualChunks: {
          // Vendor chunks
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui-library': ['vuetify'],
          
          // Domain chunks - Solo se cargan cuando se necesitan
          'auth': [
            'src/views/LoginView.vue',
            'src/views/RegisterView.vue',
            'src/stores/auth.store.ts'
          ],
          'dashboard': [
            'src/views/DashboardView.vue'
          ],
          'real-estate': [
            'src/views/RealEstateView.vue',
            'src/components/domain/RealEstateCard.vue',
            'src/stores/real-estate.store.ts',
            'src/services/real-estate.service.ts'
          ],
          'rental': [
            'src/views/RentalsView.vue',
            'src/components/domain/RentalCard.vue',
            'src/stores/rental.store.ts',
            'src/services/rental.service.ts'
          ],
          'mortgage': [
            'src/views/MortgagesView.vue',
            'src/components/domain/MortgageCard.vue',
            'src/stores/mortgage.store.ts',
            'src/services/mortgage.service.ts'
          ],
          'chatbot': [
            'src/components/ui/ChatWidget.vue',
            'src/services/chat.service.ts'
          ]
        }
      }
    },
    // ✅ Optimización adicional
    chunkSizeWarningLimit: 1000,
    sourcemap: false // Solo en desarrollo
  }
})
