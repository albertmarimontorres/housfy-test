# 🧪 Test Structure Documentation

Esta es la nueva estructura de tests organizada por funcionalidades (features) para mejor mantenibilidad y escalabilidad.

## 📁 Estructura del Directorio

```
src/test/
├── setup/                          # ⚙️ Configuraciones globales
│   ├── vitest.setup.ts             # Setup completo con Vuetify
│   └── vitest.minimal.ts           # Setup mínimo con stubs
├── utils/                          # 🔧 Utilidades compartidas
│   ├── factories.ts                # Factories para datos de test
│   └── test-helpers.ts             # Helpers de testing
├── features/                       # 🎯 Tests organizados por feature
│   └── chatbot/                    # 🤖 Funcionalidad del Chatbot
│       ├── unit/                   # Tests unitarios
│       │   ├── chat.api.test.ts    # API layer tests
│       │   └── chat.service.test.ts # Service layer tests
│       ├── components/             # Tests de componentes
│       │   ├── ChatWidget.test.ts
│       │   └── ChatWidget.simple.test.ts
│       ├── integration/            # Tests de integración
│       │   └── chatbot.integration.test.ts
│       ├── e2e/                    # Tests end-to-end
│       │   └── chatbot.e2e.test.ts
│       └── __fixtures__/           # Datos de prueba
│           ├── chat-messages.json
│           └── chat-responses.json
├── environment.test.ts             # Test básico del entorno
└── index.ts                       # Configuración central
```

## 🎯 Ventajas de esta Estructura

### ✅ **Separación de Responsabilidades**
- **Unit**: Funciones puras, lógica de negocio
- **Components**: Componentes Vue, renderizado, eventos
- **Integration**: Interacción entre capas
- **E2E**: Flujos completos de usuario

### ✅ **Reutilización de Código**
- **Factories**: Generación consistente de datos
- **Helpers**: Utilidades comunes entre tests
- **Fixtures**: Datos estáticos reutilizables

### ✅ **Mantenibilidad**
- **Feature-based**: Fácil localizar tests relacionados
- **Consistency**: Estructura predecible
- **Scalability**: Fácil añadir nuevas features

## 🔧 Uso de las Utilidades

### Factories
```typescript
import { 
  createMockChatMessage, 
  mockSuccessResponse,
  flushPromises 
} from '@/test/utils/factories'

const message = createMockChatMessage({ content: 'Test' })
const response = mockSuccessResponse('AI response')
await flushPromises()
```

### Test Helpers
```typescript
import { 
  openChatWidget, 
  sendMessageInTest,
  expectElementToBeVisible 
} from '@/test/utils/test-helpers'

await openChatWidget(wrapper)
await sendMessageInTest(wrapper, 'Hello')
expectElementToBeVisible(wrapper, '[data-testid="message"]')
```

### Fixtures
```typescript
import chatMessages from '../__fixtures__/chat-messages.json'
import chatResponses from '../__fixtures__/chat-responses.json'

const welcomeMsg = chatMessages.welcomeMessage
const successResponse = chatResponses.successResponses[0]
```

## 🚀 Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos del chatbot
npm test src/test/features/chatbot

# Solo tests unitarios
npm test src/test/features/chatbot/unit

# Solo tests de componentes  
npm test src/test/features/chatbot/components

# Tests con watch mode
npm test -- --watch
```

## 📋 Migración Completada

### ✅ **Archivos Migrados:**
- ✅ `chat.api.test.ts` → `features/chatbot/unit/`
- ✅ `chat.service.test.ts` → `features/chatbot/unit/`
- ✅ `ChatWidget.test.ts` → `features/chatbot/components/`
- ✅ `ChatWidget.simple.test.ts` → `features/chatbot/components/`
- ✅ `chatbot.integration.test.ts` → `features/chatbot/integration/`
- ✅ `chatbot.e2e.test.ts` → `features/chatbot/e2e/`

### ✅ **Utilidades Creadas:**
- ✅ Factories centralizadas
- ✅ Test helpers
- ✅ Setup files organizados
- ✅ Fixtures con datos reales

### ✅ **Configuración Actualizada:**
- ✅ `vitest.config.ts` actualizado
- ✅ Imports corregidos
- ✅ Paths y aliases configurados

## 🔮 Próximas Features

Para extender esta estructura:

```
features/
├── chatbot/          # ✅ COMPLETADO
├── real-estate/      # 🔄 PRÓXIMO
├── rentals/          # 📋 PLANIFICADO
└── mortgages/        # 📋 PLANIFICADO
```

Cada feature seguirá el mismo patrón: `unit/`, `components/`, `integration/`, `e2e/`, `__fixtures__/`.