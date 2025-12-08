# Profile Feature - Tests

Esta carpeta contiene todos los tests unitarios y de integración para la feature de Profile.

## Estructura de Tests

```
profile/
├── README.md                      # Esta documentación
├── run-profile-tests.sh          # Script para ejecutar todos los tests
├── profile.simple.test.ts        # Tests básicos de imports y estructura
├── profile.api.test.ts           # Tests de la capa API
├── profile.service.test.ts       # Tests de la capa de servicios
├── profile.store.test.ts         # Tests del store (Pinia)
├── profile.validation.test.ts    # Tests de validación de datos
└── profile.integration.test.ts   # Tests de integración completa
```

## Archivos Bajo Test

- **API**: `src/api/modules/profile.api.ts`
- **Service**: `src/services/profile.service.ts`
- **Store**: `src/stores/profile.store.ts`
- **Types**: `src/types/Profile.ts`

## Tipos de Tests Incluidos

### 1. Tests Básicos (`profile.simple.test.ts`)
- ✅ Verificación de imports y exports
- ✅ Estructura básica de módulos
- ✅ Estado inicial del store
- ✅ Compatibilidad de tipos TypeScript

### 2. Tests de API (`profile.api.test.ts`)
- ✅ Casos de éxito del endpoint getProfile
- ✅ Manejo de errores HTTP (404, 500, etc.)
- ✅ Validación de headers y autenticación
- ✅ Edge cases (network errors, timeouts)
- ✅ Mocking completo de httpClient

### 3. Tests de Service (`profile.service.test.ts`)
- ✅ Validación de respuestas de API
- ✅ Transformación de errores
- ✅ Casos edge con datos malformados
- ✅ Función validateProfileResponse
- ✅ Compatibilidad de exports

### 4. Tests de Store (`profile.store.test.ts`)
- ✅ Estado inicial y reactivo
- ✅ Action fetchProfile (éxito y error)
- ✅ Action clearProfile
- ✅ Gestión de loading states
- ✅ Manejo de errores en el store

### 5. Tests de Validation (`profile.validation.test.ts`)
- ✅ Validación de estructura ProfileResponse
- ✅ Validación de campos User
- ✅ Edge cases con datos faltantes
- ✅ Casos con tipos incorrectos
- ✅ Valores límite y boundary testing

### 6. Tests de Integration (`profile.integration.test.ts`)
- ✅ Flujo completo Store → Service → API
- ✅ Escenarios end-to-end
- ✅ Manejo de errores en cadena
- ✅ Estado del store después de operaciones

## Cobertura de Tests

**Objetivo**: Mínimo 80% coverage general, 100% para funciones core.

### Funciones Core (100% coverage requerido):
- `profileApi.getProfile()`
- `ProfileService.getProfile()`
- `validateProfileResponse()`
- `store.fetchProfile()`
- `store.clearProfile()`

### Casos de Edge Incluidos:
- Respuestas de API malformadas
- Errores de red y timeouts
- Estados de loading intermedios
- Datos de usuario incompletos
- Tokens de autenticación inválidos

## Mocking Strategy

### External Dependencies:
- **httpClient**: Completamente mockeado
- **API responses**: Simuladas con diferentes escenarios
- **Network errors**: Simulados para testing de robustez

### Pinia Store:
- Instancia limpia para cada test
- Estado inicial verificado
- Actions aisladas y testadas independientemente

## Comandos de Ejecución

```bash
# Todos los tests de profile
npm test src/test/features/profile/

# Tests individuales por archivo
npm test profile.simple.test.ts
npm test profile.api.test.ts
npm test profile.service.test.ts
npm test profile.store.test.ts
npm test profile.validation.test.ts
npm test profile.integration.test.ts

# Con coverage
npm test src/test/features/profile/ -- --coverage

# Script automatizado
./run-profile-tests.sh
```

## Patrón de Tests

Basado en el patrón establecido en `auth/`, cada test sigue la estructura:

```typescript
describe('Módulo Principal', () => {
  describe('casos de éxito', () => {
    it('debería manejar caso exitoso estándar', () => {
      // Test implementation
    });
  });

  describe('casos de error', () => {
    it('debería manejar error específico', () => {
      // Error handling test
    });
  });

  describe('edge cases', () => {
    it('debería manejar caso límite', () => {
      // Edge case test
    });
  });
});
```

## Troubleshooting

### Errores Comunes:

1. **Import errors**: Verificar rutas con alias `@/`
2. **Pinia store**: Asegurar `setActivePinia(createPinia())`
3. **TypeScript**: Usar type casting para edge cases
4. **Async tests**: Usar `await` en todas las operaciones async

### Mock Issues:
- Verificar que httpClient está mockeado correctamente
- Asegurar que los mocks se resetean entre tests
- Comprobar que las respuestas mockeadas tienen la estructura correcta

## Integración con CI/CD

Los tests están preparados para ejecutarse en pipelines de CI/CD con:
- Reportes en formato JSON
- Cobertura exportable
- Ejecución paralela segura
- Timeouts configurables

## Relación con Auth Tests

Este conjunto de tests sigue exactamente el mismo patrón y estructura que los tests de `auth/`, asegurando:
- Consistencia en el codebase
- Reutilización de patterns
- Facilidad de mantenimiento
- Standards de calidad uniformes