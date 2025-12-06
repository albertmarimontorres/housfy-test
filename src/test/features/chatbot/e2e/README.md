# 🎭 Playwright E2E Testing

Tests end-to-end del chatbot usando Playwright para simulación real del navegador.

## 🚀 Comandos de Instalación

Una vez instalado Playwright, ejecuta estos comandos en el container Docker:

```bash
# 1. Instalar Playwright
pnpm add -D @playwright/test

# 2. Instalar navegadores
pnpm exec playwright install

# 3. Solo Chromium (más ligero)
pnpm exec playwright install chromium
```

## 🎯 Scripts Disponibles

```bash
# Ejecutar todos los tests E2E
pnpm test:e2e

# Ejecutar con UI interactiva
pnpm test:e2e:ui

# Ejecutar en modo headed (ver el navegador)
pnpm test:e2e:headed

# Ejecutar en modo debug
pnpm test:e2e:debug

# Ejecutar solo tests del chatbot
pnpm test:e2e src/test/features/chatbot/e2e
```

## 🧪 Tests Implementados

### ✅ **Flujo Principal del Chatbot**
- **Visualización**: Botón flotante del chat visible
- **Apertura**: Click abre el widget del chat
- **Mensaje de Bienvenida**: Se muestra automáticamente
- **Input de Usuario**: Permite escribir y enviar mensajes
- **Respuestas de IA**: Mock de respuestas del servidor

### ✅ **Escenarios Reales de Usuario**
- **Conversación de Soporte**: Flujo típico cliente-asistente
- **Cambio de Contraseña**: Flujo específico de ayuda
- **Múltiples Mensajes**: Conversación extendida

### ✅ **Estados de Carga y Errores**
- **Loading Indicator**: Muestra while esperando respuesta
- **Error Handling**: Manejo gracioso de errores de API
- **Network Issues**: Timeout y fallos de conexión

### ✅ **Funcionalidad Avanzada**
- **Persistencia**: Conversación preservada al cerrar/abrir
- **Responsive**: Adapta a diferentes tamaños de pantalla
- **Rapid Interactions**: Manejo de mensajes rápidos consecutivos

### ✅ **Navegación y UX**
- **Open/Close**: Botón flotante ↔ Widget expandido
- **Keyboard**: Envío con Enter, navegación con Tab
- **Visual Feedback**: Estados hover, focus, disabled

## 🎭 **Características de Playwright**

### **Multi-Browser Testing**
- ✅ **Chromium** (Chrome, Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)
- ✅ **Mobile** (iOS, Android simulation)

### **Capacidades Avanzadas**
- 🎬 **Auto-screenshots** en fallos
- 📹 **Video recording** de test failures
- 🕵️ **Trace viewer** para debugging
- 🌐 **Network mocking** para APIs
- 📱 **Device emulation** para mobile testing

### **Configuración Incluida**
- 🔧 **Auto-retry** en fallos (2x en CI)
- 🎯 **Parallel execution** para velocidad
- 📊 **HTML/JSON reports** con detalles
- 🚀 **Auto-start dev server** antes de tests

## 🌟 **Ventajas sobre Vitest E2E**

| Característica | Playwright | Vitest E2E |
|---|---|---|
| **Navegador Real** | ✅ Chromium, Firefox, Safari | ❌ jsdom simulado |
| **Mobile Testing** | ✅ Device emulation | ❌ No soportado |
| **Network Mocking** | ✅ Intercepta requests HTTP | ⚠️ Limitado |
| **Visual Testing** | ✅ Screenshots, videos | ❌ No disponible |
| **Debugging** | ✅ Trace viewer, step-by-step | ⚠️ Console logs |
| **CI/CD** | ✅ Optimizado para pipelines | ⚠️ Configuración manual |

## 🔧 **Configuración del Entorno**

### **playwright.config.ts**
```typescript
export default defineConfig({
  testDir: './src/test/features',
  testMatch: '**/e2e/**/*.playwright.test.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
  },
})
```

### **Estructura de Archivos**
```
src/test/features/chatbot/e2e/
├── chatbot.playwright.test.ts    # Tests principales E2E
└── README.md                     # Esta documentación
```

## 🚀 **Próximos Pasos**

1. **Instalar Playwright** con los comandos de arriba
2. **Ejecutar tests** con `pnpm test:e2e`
3. **Ver reportes** en `playwright-report/index.html`
4. **Desarrollar más tests** siguiendo los patrones existentes

## 💡 **Tips de Desarrollo**

```typescript
// Uso de data-testid para selección confiable
await page.getByTestId('chat-button').click()

// Mock de respuestas de API
await page.route('/api/ai-chat', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true, output: 'Mock response' })
  })
})

// Esperas inteligentes
await expect(page.getByText('Expected text')).toBeVisible()
await page.waitForLoadState('networkidle')
```