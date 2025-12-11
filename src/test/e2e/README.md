# Tests E2E - Documentación Completa

Esta carpeta contiene tests end-to-end (E2E) para validar la funcionalidad completa de la aplicación.

## 🎯 Tipos de Tests

### 🚀 Tests Básicos (Nuevos - Optimizados)
Tests rápidos y enfocados en verificación de endpoints y estructura de datos:

- ✅ **mortgage.basic.e2e.test.ts** - Tests básicos para hipotecas
- ✅ **real-estate.basic.e2e.test.ts** - Tests básicos para propiedades  
- ✅ **rental.basic.e2e.test.ts** - Tests básicos para alquileres

### 🔐 Tests de Autenticación (Existentes)
Tests completos para flujos de login y registro:

- `auth/login.e2e.test.ts` - Tests de login
- `auth/register.e2e.test.ts` - Tests de registro
- `auth/login-advanced.e2e.test.ts` - Tests avanzados de login
pnpm test:e2e:ui

# Ejecutar en modo debug
pnpm test:e2e:debug

# Ejecutar solo tests de auth
npx playwright test src/test/e2e/auth/

# Ejecutar en modo headful (ver navegador)
npx playwright test --headed

# Ejecutar en navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Estructura de Tests E2E

```
src/test/e2e/
├── auth/
│   ├── login.e2e.test.ts          # Tests básicos de login
│   ├── login-advanced.e2e.test.ts # Tests avanzados de login
│   ├── register.e2e.test.ts       # Tests de registro
│   └── auth-helpers.ts            # Utilidades para tests de auth
├── mortgage/                      # Tests de hipotecas (TODO)
├── profile/                       # Tests de perfil (TODO)
├── realState/                     # Tests de inmobiliario (TODO)
├── rental/                        # Tests de alquileres (TODO)
├── e2e-helpers.ts                 # Utilidades globales
└── README.md                      # Este archivo
```

## Tests de Autenticación Implementados

### `login.e2e.test.ts` - Tests Básicos
- ✅ Mostrar página de login correctamente
- ✅ Habilitar botón cuando se completan campos
- ✅ Mostrar estado de carga al enviar
- ✅ Manejar credenciales inválidas
- ✅ Redirigir al dashboard tras login exitoso
- ✅ Navegar a página de registro
- ✅ Validar formato de email
- ✅ Funcionar en dispositivo móvil

### `login-advanced.e2e.test.ts` - Tests Avanzados
- ✅ Flujo completo de login exitoso
- ✅ Manejo de errores de red (timeout, servidor)
- ✅ Persistencia de estado tras recargar página
- ✅ Logout y redirección
- ✅ Validación de campos vacíos
- ✅ Navegación entre login y registro
- ✅ Accesibilidad - navegación por teclado
- ✅ Validación de límites de caracteres

### `register.e2e.test.ts` - Tests de Registro
- ✅ Mostrar página de registro correctamente
- ✅ Registro exitoso
- ✅ Manejar errores de registro
- ✅ Navegar a login desde registro

## Utilidades Disponibles

### `AuthE2EHelpers`
- `mockLoginAPI()` - Simula respuestas de la API de login
- `fillLoginForm()` - Llena formulario de login
- `performLogin()` - Login completo
- `verifySnackbarMessage()` - Verifica mensajes de feedback
- `verifyLoginPageElements()` - Verifica elementos de la página
- `clearStorage()` - Limpia almacenamiento local

### `E2EHelpers` (Globales)
- URLs, selectores y timeouts predefinidos
- Configuraciones de viewport para diferentes dispositivos
- Utilidades para carga, navegación y screenshots
- Simulación de red lenta
- Verificación de errores de consola
- Datos de test y mocks de API

## Configuración de Playwright

### `playwright.config.ts`
- **Base URL**: `http://localhost:5173` (puerto de Vite)
- **Test Directory**: `./src/test/e2e`
- **Navegadores**: Chromium, Firefox, WebKit
- **Dispositivos móviles**: Pixel 5, iPhone 12
- **Servidor de desarrollo**: Se inicia automáticamente
- **Reportes**: HTML y JSON

## Estrategias de Testing

### 1. Mocking de APIs
Los tests usan `page.route()` para interceptar llamadas a APIs y devolver respuestas controladas:

```typescript
await page.route('**/api/auth/login', route => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, bearer: 'token' })
  });
});
```

### 2. Selectores Robustos
Se priorizan selectores semánticos y estables:
- Tipos de input: `input[type="email"]`
- Texto visible: `text=¿No tienes cuenta?`
- Data attributes: `[data-testid="user-menu"]` (recomendado)

### 3. Manejo de Estados Asíncronos
- Uso de `waitFor()` para elementos dinámicos
- Verificación de estados de carga
- Timeouts apropiados para diferentes operaciones

### 4. Tests Responsivos
- Configuración de viewports para diferentes dispositivos
- Verificación de funcionalidad en móvil y desktop

### 5. Accesibilidad
- Navegación por teclado
- Verificación de focus management
- Soporte para lectores de pantalla (futuro)

## Mejores Prácticas

### ✅ Hacer
- Usar `test.beforeEach()` para setup común
- Limpiar estado entre tests
- Usar helpers para operaciones repetitivas
- Interceptar APIs para tests deterministas
- Verificar tanto happy path como edge cases
- Incluir tests de accesibilidad

### ❌ Evitar
- Tests que dependan de datos externos
- Hardcodear timeouts muy largos
- Selectores frágiles basados en posición
- Tests que modifiquen estado global
- Esperas arbitrarias (`page.waitForTimeout()`)

## Extensión Futura

### Tests Pendientes por Implementar
1. **Mortgage E2E Tests**
   - Listado y filtrado de hipotecas
   - Detalles de hipoteca
   - Solicitud de nueva hipoteca

2. **Real Estate E2E Tests**
   - Listado y filtrado de propiedades
   - Búsqueda y ordenamiento
   - Detalles de propiedad

3. **Rental E2E Tests**
   - Gestión de alquileres
   - Filtros avanzados
   - Contacto con propietarios

4. **Profile E2E Tests**
   - Edición de perfil
   - Cambio de contraseña
   - Configuración de cuenta

5. **Cross-Domain Tests**
   - Flujos completos usuario
   - Integración entre módulos
   - Performance y carga

### Mejoras Técnicas
- Integración con CI/CD
- Tests visuales con screenshot comparison
- Tests de rendimiento
- Cobertura de accesibilidad con axe-playwright
- Tests multi-tenant si aplica

## Troubleshooting

### Problemas Comunes

1. **Tests fallan por timeouts**
   - Verificar que el servidor de desarrollo esté corriendo
   - Aumentar timeouts en `playwright.config.ts`
   - Verificar logs de red en el navegador

2. **Selectores no encuentran elementos**
   - Usar `page.pause()` para debug interactivo
   - Verificar que el elemento existe en el DOM
   - Comprobar timing de renderizado

3. **Tests intermitentes**
   - Revisar condiciones de carrera
   - Añadir esperas explícitas
   - Verificar limpieza de estado entre tests

4. **Error de puerto ocupado**
   - Cambiar puerto en `playwright.config.ts`
   - Matar procesos que usen el puerto 5173

### Debugging
```bash
# Ejecutar con debug interactivo
npx playwright test --debug

# Ejecutar con trace viewer
npx playwright test --trace on

# Ver último reporte
npx playwright show-report
```