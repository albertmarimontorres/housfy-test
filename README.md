# 🏠 Housfy Admin Platform

Una plataforma administrativa moderna para gestión inmobiliaria construida con Vue 3, TypeScript y Vuetify. Este sistema permite a los usuarios gestionar propiedades, alquileres, hipotecas y más funcionalidades relacionadas con bienes raíces.

## 🚀 Características

- **🔐 Autenticación completa** - Sistema de login y registro con validaciones
- **🏘️ Gestión de Propiedades** - CRUD completo para compraventa de inmuebles
- **🏠 Gestión de Alquileres** - Administración de propiedades en alquiler
- **💰 Calculadora de Hipotecas** - Herramientas financieras integradas
- **👤 Gestión de Perfiles** - Sistema de perfiles de usuario
- **🤖 Chatbot IA** - Asistente virtual integrado
- **📱 Responsive Design** - Optimizado para móvil y desktop
- **🌙 Dark/Light Mode** - Soporte para temas
- **♿ Accesibilidad** - Navegación por teclado y estándares WCAG

## 🛠️ Stack Tecnológico

### Frontend
- **Vue 3** - Framework progresivo de JavaScript
- **TypeScript** - Tipado estático para JavaScript
- **Vuetify 3** - Framework de componentes Material Design
- **Vue Router** - Enrutador oficial para Vue.js
- **Pinia** - Gestión de estado moderna para Vue

### Herramientas de Desarrollo
- **Vite** - Build tool ultrarrápido
- **Vitest** - Framework de testing unitario
- **Playwright** - Testing E2E automatizado
- **ESLint** - Linter para JavaScript/TypeScript

### DevOps y Deployment
- **Docker** - Containerización
- **Docker Compose** - Orquestación de contenedores

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- pnpm (recomendado) o npm
- Docker y Docker Compose (opcional)

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/albertmarimontorres/housfy-test.git
cd housfy-test

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor de desarrollo
pnpm dev
```

### 🐳 Instalación con Docker

```bash
# Construir y ejecutar con Docker Compose
docker-compose up --build

# Solo construir
docker build -t housfy-admin .

# Ejecutar contenedor
docker run -p 5173:5173 housfy-admin
```

## 🎮 Scripts Disponibles

### Desarrollo
```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm preview      # Preview del build
```

### Testing
```bash
# Tests unitarios
pnpm test:unit             # Ejecutar tests unitarios
pnpm test:unit:watch       # Modo watch para desarrollo
pnpm test:unit:coverage    # Con reporte de cobertura

# Tests de integración
pnpm test:integration      # Tests de integración

# Tests E2E
pnpm test:e2e             # E2E con servidor incluido
pnpm test:e2e:no-server   # E2E (servidor externo)
pnpm test:e2e:debug       # E2E en modo debug

# Tests de smoke
pnpm test:smoke           # Tests básicos de funcionamiento

# Todos los tests
pnpm test                 # Ejecutar toda la suite
```

### Utilidades
```bash
pnpm lint         # Linter ESLint
pnpm type-check   # Verificación de tipos TypeScript
```

## 🏗️ Estructura del Proyecto

```
housfy-admin/
├── src/
│   ├── api/                 # Cliente HTTP y módulos API
│   │   ├── httpClient.ts    # Configuración Axios
│   │   └── modules/         # Módulos específicos por dominio
│   ├── components/          # Componentes Vue
│   │   ├── layouts/         # Layouts de aplicación
│   │   ├── ui/             # Componentes UI reutilizables
│   │   └── domain/         # Componentes específicos de dominio
│   ├── router/             # Configuración Vue Router
│   ├── services/           # Lógica de negocio
│   ├── stores/             # Gestión de estado (Pinia)
│   ├── types/              # Definiciones TypeScript
│   ├── utils/              # Utilidades y helpers
│   ├── views/              # Páginas/Vistas principales
│   └── test/               # Tests organizados por tipo
│       ├── unit/           # Tests unitarios
│       ├── integration/    # Tests de integración
│       ├── e2e/           # Tests end-to-end
│       ├── smoke/         # Tests de smoke
│       └── utils/         # Utilidades de testing
├── playwright-report/      # Reportes de Playwright
├── docker-compose.yml      # Configuración Docker Compose
├── Dockerfile             # Configuración Docker
└── playwright.config.ts   # Configuración Playwright
```

## 🔧 Configuración

### Variables de Entorno

```env
# API Configuration
VITE_HOUSFY_BASE_URL=https://n8n.housfy.com/webhook
VITE_HOUSFY_ID=your-api-id

# App Configuration
VITE_APP_NAME=Housfy Admin
VITE_APP_VERSION=1.0.0
```

### Configuración de Testing

El proyecto incluye una suite completa de testing:

- **Unitarios**: Vitest para lógica de negocio
- **Integración**: Testing de módulos completos
- **E2E**: Playwright para flujos de usuario
- **Smoke**: Tests básicos de funcionalidad

## 🎨 Características de UI/UX

### Temas y Personalización
- Material Design 3 con Vuetify
- Tema personalizado de Housfy
- Soporte completo para modo oscuro/claro
- Componentes responsivos

### Accesibilidad
- Navegación por teclado completa
- Soporte para lectores de pantalla
- Contraste de colores optimizado
- Indicadores de focus visibles

## 🔐 Autenticación y Seguridad

- Sistema de autenticación JWT
- Validación de formularios robusta
- Rutas protegidas
- Gestión segura de tokens
- Interceptores HTTP para renovación automática

## 🚀 Deployment

### Producción
```bash
# Build optimizado
pnpm build

# Preview local del build
pnpm preview
```

### Docker Production
```bash
# Build para producción
docker build -t housfy-admin:prod --target production .

# Ejecutar en producción
docker run -p 80:80 housfy-admin:prod
```

## 🧪 Testing Strategy

### Pirámide de Testing
1. **Tests Unitarios** (70%) - Lógica de negocio y utilidades
2. **Tests de Integración** (20%) - Módulos y servicios
3. **Tests E2E** (10%) - Flujos críticos de usuario

### Coverage Goals
- Unitarios: >90%
- Integración: >80%
- E2E: Flujos críticos cubiertos

## 📈 Rendimiento

### Optimizaciones Implementadas
- Lazy loading de rutas
- Code splitting automático
- Optimización de imágenes
- Tree shaking
- Minificación automática
- Caching estratégico

### Métricas
- Lighthouse Score: 95+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s

## 🤝 Contribución

### Flujo de Desarrollo
1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'feat: añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código
- TypeScript estricto
- ESLint para consistencia
- Prettier para formato
- Conventional Commits
- Tests obligatorios para nuevas features

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización documentación
style: cambios de formato
refactor: refactorización de código
test: añadir o corregir tests
chore: tareas de mantenimiento
```

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

- **Albert Marimón Torres** - [@albertmarimontorres](https://github.com/albertmarimontorres)

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 Email: [support@housfy.com](mailto:support@housfy.com)
- 🐛 Issues: [GitHub Issues](https://github.com/albertmarimontorres/housfy-test/issues)
- 📖 Docs: [Documentación](https://docs.housfy.com)

## 🔄 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para un historial detallado de cambios.

---

<div align="center">

**[⬆ Volver al inicio](#-housfy-admin-platform)**

Hecho con ❤️ por el equipo de Housfy

</div>
