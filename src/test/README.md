# Estructura de Tests# 🧪 Testing Structure - Vue.js Chatbot



Este proyecto utiliza una estructura de tests organizada por **tipo de test** en lugar de dominio, lo que facilita la ejecución y mantenimiento de diferentes tipos de pruebas.Este proyecto utiliza [Vitest](https://vitest.dev/) como framework de testing con una estructura organizada por funcionalidades.



## 📁 Estructura de Directorios## 🏗️ Nueva Estructura Organizada



``````

src/test/src/test/

├── unit/           # Tests unitarios (API, Service, Store)├── 🛠️  setup/               # Configuraciones globales

│   ├── auth/│   ├── vitest.setup.ts      # Setup completo con Vuetify  

│   ├── profile/│   └── vitest.minimal.ts    # Setup mínimo con stubs

│   ├── realState/├── 🔧  utils/               # Utilidades compartidas

│   ├── rental/│   ├── factories.ts         # Factories para datos de test

│   └── mortgage/│   └── test-helpers.ts      # Helpers de testing

├── integration/    # Tests de integración├── 🎯  features/            # Tests organizados por feature

│   ├── auth/│   └── chatbot/             # 🤖 Funcionalidad del Chatbot

│   ├── profile/│       ├── unit/            # Tests unitarios (API, Services)

│   ├── realState/│       ├── components/      # Tests de componentes Vue

│   ├── rental/│       ├── integration/     # Tests de integración

│   └── mortgage/│       ├── e2e/            # Tests end-to-end

├── e2e/           # Tests end-to-end (pendientes)│       └── __fixtures__/    # Datos de prueba estáticos

│   ├── auth/├── __mocks__/              # Mocks globales

│   ├── profile/├── environment.test.ts     # Test básico del entorno

│   ├── realState/└── index.ts               # Configuración central

│   ├── rental/```

│   └── mortgage/

├── validation/    # Tests de validación de datos## 📋 **Migración Completada - Archivos Eliminados**

│   ├── auth/

│   ├── profile/### ✅ Tests migrados exitosamente:

│   ├── realState/- ✅ `ChatWidget.test.ts` → `features/chatbot/components/`

│   ├── rental/- ✅ `ChatWidget.simple.test.ts` → `features/chatbot/components/` 

│   └── mortgage/- ✅ `chat.api.test.ts` → `features/chatbot/unit/`

├── smoke/         # Tests de humo/simples- ✅ `chat.service.test.ts` → `features/chatbot/unit/`

│   ├── auth/- ✅ `chatbot.integration.test.ts` → `features/chatbot/integration/`

│   ├── profile/- ✅ `chatbot.e2e.test.ts` → `features/chatbot/e2e/`

│   ├── realState/- ✅ `factories.ts` → `utils/factories.ts`

│   ├── rental/- ✅ `setup.ts` → `setup/vitest.setup.ts`

│   └── mortgage/- ✅ `setup.minimal.ts` → `setup/vitest.minimal.ts`

├── features/      # Tests específicos por funcionalidad

│   └── chatbot/## 🚀 Scripts de NPM

├── setup/         # Configuración de tests

├── utils/         # Utilidades para tests```bash

├── __mocks__/     # Mocks globales# Ejecutar todos los tests

└── scripts/       # Scripts de ejecuciónnpm test

```

# Tests específicos del chatbot  

## 🧪 Tipos de Testsnpm test src/test/features/chatbot



### Unit Tests (`/unit`)# Solo tests unitarios del chatbot

- **API Tests**: Tests de endpoints y llamadas HTTPnpm test src/test/features/chatbot/unit

- **Service Tests**: Tests de lógica de negocio

- **Store Tests**: Tests de estados y mutaciones (Pinia)# Solo tests de componentes del chatbot

- **Utility Tests**: Tests de funciones helpernpm test src/test/features/chatbot/components



### Integration Tests (`/integration`)# Tests con modo watch

- Tests que verifican la interacción entre componentesnpm test -- --watch

- Flujos completos de datos```

- Integración API + Service + Store

# Ejecutar tests con interfaz web

### Validation Tests (`/validation`)pnpm test:ui

- Validación de schemas y tipos

- Reglas de negocio específicas# Ejecutar tests una sola vez

- Validación de entrada/salida de datospnpm test:run



### Smoke Tests (`/smoke`)# Ejecutar tests con coverage

- Tests básicos que verifican funcionalidad corepnpm coverage

- Tests rápidos para verificar que no se rompió nada

- Ideal para CI/CD pipelines# Ejecutar solo tests del chatbot

pnpm test chat

### E2E Tests (`/e2e`)

- Tests end-to-end usando Playwright# Ejecutar tests de integración

- Simulación completa de usuariopnpm test integration

- Tests de flujos críticos```



## 🎯 Cobertura Objetivo## Estructura de Tests del Chatbot



### Mínima General: 80%Los tests están organizados en `/src/test/` por layers:

### Core Functions: 100%

### Tests Unitarios

**Funciones Core por Dominio:**- `chat.api.test.ts` - Tests del layer API

- **Auth**: login, logout, token management- `chat.service.test.ts` - Tests del layer de servicios

- **Profile**: getUserProfile, updateProfile- `factories.ts` - Utilidades y factories para testing

- **RealState**: getRealEstateProperties, searchProperties

- **Rental**: getRentals, searchRentals### Tests de Componentes

- **Mortgage**: getMortgages, calculateMortgage- `ChatWidget.test.ts` - Tests del componente principal del chat



## 🚀 Comandos de Ejecución### Tests de Integración

- `chatbot.integration.test.ts` - Tests de integración entre layers

### Por Tipo de Test- `chatbot.e2e.test.ts` - Tests end-to-end de casos de uso reales

```bash

# Tests unitarios### Configuración

npm test src/test/unit- `setup.ts` - Configuración global de testing

- `vitest.d.ts` - Declaraciones de tipos

# Tests de integración

npm test src/test/integration## Cobertura de Tests Implementada



# Tests de validación### 📡 API Layer (`chat.api.test.ts`)

npm test src/test/validation- ✅ Requests HTTP correctos al endpoint `/ai-chat`

- ✅ Manejo de respuestas exitosas y fallidas

# Tests de humo- ✅ Gestión de errores de red (500, 429, 400, timeout)

npm test src/test/smoke- ✅ Validación de formato de request/response

```- ✅ Tests de performance con requests concurrentes

- ✅ Manejo de mensajes largos y caracteres especiales

### Por Dominio

```bash### 🔧 Service Layer (`chat.service.test.ts`)  

# Auth domain (todos los tipos)- ✅ Delegación correcta al API layer

npm test src/test/unit/auth src/test/integration/auth src/test/validation/auth- ✅ Creación de mensajes de usuario y asistente

- ✅ Generación de IDs únicos para mensajes

# RealState domain- ✅ Formateo de timestamps en español

npm test src/test/unit/realState src/test/integration/realState src/test/validation/realState- ✅ Validación de unicidad y consistencia de datos

- ✅ Scenarios de integración entre funciones

# Rental domain

npm test src/test/unit/rental src/test/integration/rental src/test/validation/rental### 🎨 Component Layer (`ChatWidget.test.ts`)

- ✅ Renderizado inicial del botón y tooltip

# Mortgage domain- ✅ Apertura/cierre del chat container

npm test src/test/unit/mortgage src/test/integration/mortgage src/test/validation/mortgage- ✅ Envío de mensajes por click y Enter

```- ✅ Estados de loading y disabled

- ✅ Display de mensajes de usuario y asistente

### Coverage- ✅ Manejo de errores de API

```bash- ✅ Auto-scroll y accesibilidad

# Coverage completo- ✅ Performance con muchos mensajes

npm test -- --coverage

### 🔄 Integration Tests (`chatbot.integration.test.ts`)

# Coverage por dominio- ✅ Flujos completos de conversación

npm test src/test/unit/auth -- --coverage- ✅ Mantenimiento de contexto y orden de mensajes

```- ✅ Recuperación de errores de red

- ✅ Estados del chat (minimizar/maximizar)

## 📊 Estado Actual- ✅ Responses malformados y edge cases

- ✅ Performance bajo carga

### ✅ Completado

- **Auth Domain**: 5 archivos de test (API, Service, Store, Validation, Integration, Simple)### 🎯 E2E Tests (`chatbot.e2e.test.ts`)

- **Profile Domain**: 6 archivos de test- ✅ Scenarios reales de soporte al cliente

- **RealState Domain**: 6 archivos de test (2000+ líneas)- ✅ Flujos de consulta de propiedades

- **Rental Domain**: 6 archivos de test (1200+ líneas)- ✅ Patrones de escritura de usuarios

- **Mortgage Domain**: 6 archivos de test (1400+ líneas)- ✅ Mensajes largos y contenido internacional

- ✅ Conversaciones extensas

### 📝 Total de Tests- ✅ Mantenimiento de contexto

- **39 archivos de test**

- **6000+ líneas de código de test**## Mocks y Factories

- **Cobertura objetivo**: 80% mínimo, 100% funciones core

### `factories.ts` - Utilidades de Testing

## 🔧 Configuración```typescript

// Crear mensajes de prueba

### Vitest Configconst message = createMockChatMessage({ role: 'user', content: 'Test' })

```typescript

// vitest.config.ts// Crear conversaciones completas

export default defineConfig({const conversation = createMockConversation(5)

  test: {

    coverage: {// Simular respuestas de API

      reporter: ['text', 'html', 'clover'],const response = mockSuccessResponse('AI response')

      threshold: {const error = mockNetworkError()

        global: {```

          branches: 80,

          functions: 80,### Mocks Globales Configurados

          lines: 80,- **HTTP Client**: Mock completo de axios para testing de APIs

          statements: 80- **Vuetify Components**: Configurados para rendering en tests

        }- **Browser APIs**: matchMedia, ResizeObserver, IntersectionObserver

      }- **Services**: Mocks inteligentes que preservan funcionalidad

    }

  }## Patrones de Testing Implementados

})

```### 🎯 Testing por Layers

```typescript

### Patterns de Naming// API Layer - Mock HTTP, test logic

- **Unit**: `[domain].[type].test.ts` (ej: `auth.api.test.ts`)vi.mock('@/api/httpClient')

- **Integration**: `[domain].integration.test.ts`

- **Validation**: `[domain].validation.test.ts`// Service Layer - Mock API, test business logic  

- **Smoke**: `[domain].simple.test.ts`vi.mock('@/api/modules/chat.api')



## 🏗️ Migración Realizada// Component Layer - Mock services, test UI

vi.mock('@/services/chat.service')

Los tests fueron migrados desde una estructura basada en dominio (`/features/[domain]/`) a una estructura basada en tipo de test para:```



1. **Mejor organización**: Ejecutar todos los tests de un tipo específico### 📝 Arrange-Act-Assert Pattern

2. **CI/CD optimizado**: Diferentes pipelines para different tipos```typescript

3. **Mantenimiento**: Más fácil mantener tests similares juntosit('should send message correctly', async () => {

4. **Performance**: Ejecutar solo los tests necesarios según el cambio  // Arrange

  const mockResponse = mockSuccessResponse('AI response')

---  mockApi.mockResolvedValue(mockResponse)

  

**Última actualización**: Diciembre 2024  // Act

**Framework**: Vitest + Vue 3 + Pinia + TypeScript  const result = await chatService.sendMessage('user input')
  
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