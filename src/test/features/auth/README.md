# Tests de Autenticación

## 📋 Descripción

Suite completa de tests unitarios e integración para el sistema de autenticación con **Vitest**. Cubre login, registro, validaciones y manejo de errores con un coverage mínimo del 80%.

## 🎯 Objetivos de Coverage

- **Coverage global**: ≥ 80%
- **Funciones core**: 100% (AuthService.login, AuthService.register, validaciones)
- **API layer**: ≥ 90%
- **Edge cases**: Completo

## 📁 Estructura de Tests

```
src/test/features/auth/
├── auth.service.test.ts     # Tests del servicio principal
├── auth.api.test.ts         # Tests de la capa API
├── auth.validation.test.ts  # Tests de validaciones
├── auth.integration.test.ts # Tests de integración
└── README.md               # Esta documentación
```

## 🧪 Casos de Test Cubiertos

### 1. AuthService (auth.service.test.ts)
#### Login
- ✅ **Casos de éxito**
  - Login exitoso con credenciales válidas
  - Email con espacios automáticamente recortados
  - Password exactamente de 8 caracteres (valor límite)

- ✅ **Casos de error de validación**
  - Email vacío o solo espacios
  - Password vacío o solo espacios
  - Email con formato inválido
  - Password con menos de 8 caracteres

- ✅ **Edge cases**
  - Credentials null/undefined
  - Email/password null
  - Objetos con propiedades adicionales

- ✅ **Errores de API**
  - Re-lanzamiento de errores conocidos
  - Manejo de errores desconocidos
  - API que lanza null/undefined

#### Register
- ✅ **Casos de éxito**
  - Registro exitoso con datos válidos
  - FullName con acentos y caracteres especiales
  - FullName con ñ
  - FullName exactamente de 2 caracteres

- ✅ **Validaciones heredadas**
  - Todas las validaciones de email/password
  - Comportamiento consistente con login

- ✅ **Validaciones específicas**
  - FullName vacío o solo espacios
  - FullName menor a 2 caracteres
  - FullName con caracteres no válidos

- ✅ **Edge cases**
  - Payload null/undefined
  - FullName null/undefined
  - Objetos con propiedades adicionales

### 2. Auth API (auth.api.test.ts)
- ✅ **Login exitoso** y devolución de datos
- ✅ **Register exitoso** y devolución de datos
- ✅ **Propagación de errores** (red, 401, 409, 500, timeout)
- ✅ **Edge cases**: respuestas undefined, null, vacías
- ✅ **Integración HTTP**: endpoints correctos, métodos POST

### 3. Validaciones (auth.validation.test.ts)
- ✅ **Validación de emails**: formatos válidos/inválidos
- ✅ **Validación de passwords**: longitud, espacios
- ✅ **Validación de nombres**: caracteres permitidos, longitud
- ✅ **Valores límite**: strings extremadamente largos
- ✅ **Caracteres especiales** en límites

### 4. Integración (auth.integration.test.ts)
- ✅ **Flujos completos** desde validación hasta API
- ✅ **Fallo en validación** antes de llamada API
- ✅ **Manejo de errores** después de validación exitosa
- ✅ **Escenarios de red**: timeouts, 5xx, 4xx
- ✅ **Datos extremos** que pasan validación
- ✅ **Contratos de tipos** y estructura de datos

## 🎪 Mocks y Dependencias

### Dependencias Mockeadas
```typescript
// HTTP Client
vi.mock('@/api/httpClient')

// Auth API Module
vi.mock('@/api/modules/auth.api')
```

### Estrategia de Mocking
- **Aislamiento completo** de dependencias externas
- **Mocks configurables** para diferentes escenarios
- **Verificación de llamadas** con parámetros exactos
- **Simulación de errores** realistas

## 📊 Métricas de Calidad

### Cobertura Esperada
- **Statements**: ≥ 85%
- **Branches**: ≥ 80%
- **Functions**: ≥ 95%
- **Lines**: ≥ 85%

### Casos por Función
- `AuthService.login`: **45+ tests**
- `AuthService.register`: **50+ tests**
- `authApi.login`: **15+ tests**
- `authApi.register`: **15+ tests**
- Validaciones: **60+ tests**
- Integración: **20+ tests**

**Total: 200+ casos de test**

## 🚀 Ejecución

```bash
# Ejecutar todos los tests de auth
npm run test src/test/features/auth/

# Ejecutar con coverage
npm run test src/test/features/auth/ --coverage

# Ejecutar tests específicos
npm run test auth.service.test.ts
npm run test auth.api.test.ts
npm run test auth.validation.test.ts
npm run test auth.integration.test.ts

# Watch mode
npm run test src/test/features/auth/ --watch
```

## 🔍 Edge Cases Específicos

### Valores Límite
- Email máximo válido: `usuario@dominio.com`
- Password mínimo: `12345678` (8 caracteres)
- FullName mínimo: `Jo` (2 caracteres)
- Strings extremadamente largos (1000+ caracteres)

### Caracteres Especiales Permitidos
- **Nombres**: `a-zA-ZÀ-ÿñÑ '-`
- **Emails**: RFC 5322 compliant
- **Passwords**: Sin restricciones de caracteres

### Tipos de Error Cubiertos
- Validación: 12+ tipos diferentes
- Red: timeouts, conexión, DNS
- API: 400, 401, 409, 500, formato inválido
- Sistema: null, undefined, tipos incorrectos

## 📈 Resultados Esperados

Al ejecutar la suite completa, deberías ver:
- ✅ Todos los tests pasan
- 📊 Coverage ≥ 80% global
- 🎯 Funciones core al 100%
- 🚫 0 errores no manejados
- ⚡ Ejecución rápida (< 5 segundos)

## 🛠️ Mantenimiento

### Para agregar nuevos tests:
1. Identifica la función/caso no cubierto
2. Agrégalo al archivo correspondiente
3. Verifica que los mocks sean apropiados
4. Ejecuta coverage para confirmar mejora

### Para modificar validaciones:
1. Actualiza `auth.validation.test.ts`
2. Actualiza casos relacionados en otros archivos
3. Verifica que los edge cases sigan siendo válidos

---

**✨ Esta suite garantiza la robustez y confiabilidad del sistema de autenticación.**