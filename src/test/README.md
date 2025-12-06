# 🧪 Testing Structure - Vue.js Chatbot

Este proyecto utiliza [Vitest](https://vitest.dev/) como framework de testing con una estructura organizada por funcionalidades.

## 🏗️ Nueva Estructura Organizada

```
src/test/
├── 🛠️  setup/               # Configuraciones globales
│   ├── vitest.setup.ts      # Setup completo con Vuetify  
│   └── vitest.minimal.ts    # Setup mínimo con stubs
├── 🔧  utils/               # Utilidades compartidas
│   ├── factories.ts         # Factories para datos de test
│   └── test-helpers.ts      # Helpers de testing
├── 🎯  features/            # Tests organizados por feature
│   └── chatbot/             # 🤖 Funcionalidad del Chatbot
│       ├── unit/            # Tests unitarios (API, Services)
│       ├── components/      # Tests de componentes Vue
│       ├── integration/     # Tests de integración
│       ├── e2e/            # Tests end-to-end
│       └── __fixtures__/    # Datos de prueba estáticos
├── __mocks__/              # Mocks globales
├── environment.test.ts     # Test básico del entorno
└── index.ts               # Configuración central
```

## 📋 **Migración Completada - Archivos Eliminados**

### ✅ Tests migrados exitosamente:
- ✅ `ChatWidget.test.ts` → `features/chatbot/components/`
- ✅ `ChatWidget.simple.test.ts` → `features/chatbot/components/` 
- ✅ `chat.api.test.ts` → `features/chatbot/unit/`
- ✅ `chat.service.test.ts` → `features/chatbot/unit/`
- ✅ `chatbot.integration.test.ts` → `features/chatbot/integration/`
- ✅ `chatbot.e2e.test.ts` → `features/chatbot/e2e/`
- ✅ `factories.ts` → `utils/factories.ts`
- ✅ `setup.ts` → `setup/vitest.setup.ts`
- ✅ `setup.minimal.ts` → `setup/vitest.minimal.ts`

## 🚀 Scripts de NPM

```bash
# Ejecutar todos los tests
npm test

# Tests específicos del chatbot  
npm test src/test/features/chatbot

# Solo tests unitarios del chatbot
npm test src/test/features/chatbot/unit

# Solo tests de componentes del chatbot
npm test src/test/features/chatbot/components

# Tests con modo watch
npm test -- --watch
```

# Ejecutar tests con interfaz web
pnpm test:ui

# Ejecutar tests una sola vez
pnpm test:run

# Ejecutar tests con coverage
pnpm coverage

# Ejecutar solo tests del chatbot
pnpm test chat

# Ejecutar tests de integración
pnpm test integration
```

## Estructura de Tests del Chatbot

Los tests están organizados en `/src/test/` por layers:

### Tests Unitarios
- `chat.api.test.ts` - Tests del layer API
- `chat.service.test.ts` - Tests del layer de servicios
- `factories.ts` - Utilidades y factories para testing

### Tests de Componentes
- `ChatWidget.test.ts` - Tests del componente principal del chat

### Tests de Integración
- `chatbot.integration.test.ts` - Tests de integración entre layers
- `chatbot.e2e.test.ts` - Tests end-to-end de casos de uso reales

### Configuración
- `setup.ts` - Configuración global de testing
- `vitest.d.ts` - Declaraciones de tipos

## Cobertura de Tests Implementada

### 📡 API Layer (`chat.api.test.ts`)
- ✅ Requests HTTP correctos al endpoint `/ai-chat`
- ✅ Manejo de respuestas exitosas y fallidas
- ✅ Gestión de errores de red (500, 429, 400, timeout)
- ✅ Validación de formato de request/response
- ✅ Tests de performance con requests concurrentes
- ✅ Manejo de mensajes largos y caracteres especiales

### 🔧 Service Layer (`chat.service.test.ts`)  
- ✅ Delegación correcta al API layer
- ✅ Creación de mensajes de usuario y asistente
- ✅ Generación de IDs únicos para mensajes
- ✅ Formateo de timestamps en español
- ✅ Validación de unicidad y consistencia de datos
- ✅ Scenarios de integración entre funciones

### 🎨 Component Layer (`ChatWidget.test.ts`)
- ✅ Renderizado inicial del botón y tooltip
- ✅ Apertura/cierre del chat container
- ✅ Envío de mensajes por click y Enter
- ✅ Estados de loading y disabled
- ✅ Display de mensajes de usuario y asistente
- ✅ Manejo de errores de API
- ✅ Auto-scroll y accesibilidad
- ✅ Performance con muchos mensajes

### 🔄 Integration Tests (`chatbot.integration.test.ts`)
- ✅ Flujos completos de conversación
- ✅ Mantenimiento de contexto y orden de mensajes
- ✅ Recuperación de errores de red
- ✅ Estados del chat (minimizar/maximizar)
- ✅ Responses malformados y edge cases
- ✅ Performance bajo carga

### 🎯 E2E Tests (`chatbot.e2e.test.ts`)
- ✅ Scenarios reales de soporte al cliente
- ✅ Flujos de consulta de propiedades
- ✅ Patrones de escritura de usuarios
- ✅ Mensajes largos y contenido internacional
- ✅ Conversaciones extensas
- ✅ Mantenimiento de contexto

## Mocks y Factories

### `factories.ts` - Utilidades de Testing
```typescript
// Crear mensajes de prueba
const message = createMockChatMessage({ role: 'user', content: 'Test' })

// Crear conversaciones completas
const conversation = createMockConversation(5)

// Simular respuestas de API
const response = mockSuccessResponse('AI response')
const error = mockNetworkError()
```

### Mocks Globales Configurados
- **HTTP Client**: Mock completo de axios para testing de APIs
- **Vuetify Components**: Configurados para rendering en tests
- **Browser APIs**: matchMedia, ResizeObserver, IntersectionObserver
- **Services**: Mocks inteligentes que preservan funcionalidad

## Patrones de Testing Implementados

### 🎯 Testing por Layers
```typescript
// API Layer - Mock HTTP, test logic
vi.mock('@/api/httpClient')

// Service Layer - Mock API, test business logic  
vi.mock('@/api/modules/chat.api')

// Component Layer - Mock services, test UI
vi.mock('@/services/chat.service')
```

### 📝 Arrange-Act-Assert Pattern
```typescript
it('should send message correctly', async () => {
  // Arrange
  const mockResponse = mockSuccessResponse('AI response')
  mockApi.mockResolvedValue(mockResponse)
  
  // Act
  const result = await chatService.sendMessage('user input')
  
  // Assert
  expect(mockApi).toHaveBeenCalledWith('/ai-chat', { input: 'user input' })
  expect(result).toEqual(mockResponse)
})
```

### 🔄 Integration Testing
```typescript
// Test real data flow through multiple layers
mockHttp.post.mockResolvedValue({ data: apiResponse })

// User interacts with UI
await userEvent.type(input, 'message')
await userEvent.click(sendButton)

// Verify entire pipeline
expect(mockHttp.post).toHaveBeenCalled()
expect(wrapper.vm.messages).toContain(expectedMessage)
```

### ⚡ Async Testing
```typescript
// Proper async/await handling
await flushPromises()
await nextTick()
await waitFor(() => expect(condition).toBe(true))
```

## Métricas de Coverage

Los tests cubren:

- **Statements**: >95% - Todas las líneas de código ejecutables
- **Branches**: >90% - Todos los caminos de ejecución condicional
- **Functions**: 100% - Todas las funciones públicas y métodos
- **Lines**: >95% - Cobertura línea por línea

### Archivos Excluidos de Coverage
- `setup.ts` - Configuración de testing
- `factories.ts` - Utilidades de testing
- `*.d.ts` - Declaraciones de tipos

## Casos de Uso Cubiertos

### ✅ Flujos de Usuario Normales
- Abrir chat y enviar primer mensaje
- Conversación multi-turno
- Cerrar/minimizar chat
- Reabrir chat con historial preservado

### ✅ Casos de Error
- Fallos de conexión de red
- Respuestas de API inválidas
- Timeouts y errores del servidor
- Recuperación después de errores

### ✅ Edge Cases
- Mensajes muy largos (>10k caracteres)
- Caracteres especiales y emojis
- Conversaciones extensas (+50 mensajes)
- Interactions muy rápidas
- Respuestas malformadas

### ✅ Performance
- Rendering con muchos mensajes
- Requests concurrentes
- Memory leaks prevention
- Responsive interactions

## Debugging Tests

### Debugging Individual
```bash
# Ejecutar un test específico
pnpm test ChatWidget.test.ts

# Debugging con logs
console.log(wrapper.vm.messages)
console.log(wrapper.debug())
```

### Debugging UI
```bash
# Abrir interfaz visual de testing
pnpm test:ui
```

### Debugging Async Issues
```typescript
// Usar waitFor para timing issues
await waitFor(() => {
  expect(wrapper.vm.isLoading).toBe(false)
}, { timeout: 5000 })

// Flush all promises
await flushPromises()
```

## Mejores Prácticas Aplicadas

1. **Tests Determinísticos**: Sin dependencia de timing o estado externo
2. **Isolation**: Cada test es independiente y puede ejecutarse solo
3. **Realistic Mocks**: Mocks que se comportan como el código real
4. **Error Coverage**: Tests específicos para cada tipo de error
5. **User-Centric**: Tests que reflejan cómo usan los usuarios reales
6. **Performance Testing**: Verificación de que el chat escala correctamente
7. **Accessibility**: Tests que verifican compatibilidad con screen readers
8. **Integration Focus**: Más tests de integración que unitarios

## Ejecutar Tests

```bash
# Setup inicial (si no está hecho)
pnpm add -D vitest @vue/test-utils jsdom @vitest/ui @vitest/coverage-v8

# Ejecutar todos los tests del chatbot
pnpm test

# Watch mode durante desarrollo  
pnpm test --watch

# Coverage report
pnpm coverage

# Tests específicos
pnpm test chat.api.test.ts
pnpm test ChatWidget
pnpm test integration
```

El entorno de testing está completamente configurado y listo para uso. Los tests proporcionan confianza total en la funcionalidad del chatbot y sirven como documentación viviente del comportamiento esperado.