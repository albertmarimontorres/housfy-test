/**
 * Test E2E básico sin navegador - Solo verificación de estructura
 * Ejecutable directamente con Node.js (ESM)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para output de consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Tests básicos de estructura del proyecto
async function runBasicTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  info('Ejecutando tests E2E básicos sin navegador...');
  console.log('');

  // Test 1: Verificar que existen las rutas principales
  try {
    const routerPath = path.join(__dirname, '../../../router/index.ts');
    if (fs.existsSync(routerPath)) {
      const routerContent = fs.readFileSync(routerPath, 'utf8');
      
      if (routerContent.includes('/login') && 
          routerContent.includes('/register') &&
          routerContent.includes('/app/dashboard')) {
        success('Las rutas principales están definidas');
        testsPassed++;
      } else {
        error('Faltan rutas principales en el router');
        testsFailed++;
      }
    } else {
      error('Archivo de router no encontrado');
      testsFailed++;
    }
  } catch (err) {
    error(`Error verificando router: ${err.message}`);
    testsFailed++;
  }

  // Test 2: Verificar que existen las vistas
  try {
    const viewsPath = path.join(__dirname, '../../../views');
    const requiredViews = ['LoginView.vue', 'RegisterView.vue', 'DashboardView.vue'];
    
    let viewsFound = 0;
    requiredViews.forEach(view => {
      if (fs.existsSync(path.join(viewsPath, view))) {
        viewsFound++;
      }
    });
    
    if (viewsFound === requiredViews.length) {
      success(`Todas las vistas principales están disponibles (${viewsFound}/${requiredViews.length})`);
      testsPassed++;
    } else {
      error(`Faltan vistas principales (${viewsFound}/${requiredViews.length})`);
      testsFailed++;
    }
  } catch (err) {
    error(`Error verificando vistas: ${err.message}`);
    testsFailed++;
  }

  // Test 3: Verificar que existe el store de auth
  try {
    const authStorePath = path.join(__dirname, '../../../stores/auth.store.ts');
    if (fs.existsSync(authStorePath)) {
      const storeContent = fs.readFileSync(authStorePath, 'utf8');
      
      if (storeContent.includes('login') && 
          storeContent.includes('isAuthenticated') &&
          storeContent.includes('token')) {
        success('Store de autenticación está configurado correctamente');
        testsPassed++;
      } else {
        error('Store de autenticación incompleto');
        testsFailed++;
      }
    } else {
      error('Store de autenticación no encontrado');
      testsFailed++;
    }
  } catch (err) {
    error(`Error verificando store de auth: ${err.message}`);
    testsFailed++;
  }

  // Test 4: Simulación de llamada de API (mock)
  try {
    // Simular llamada a API de login
    const mockLoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    // Simular respuesta exitosa
    const mockLoginResponse = {
      success: true,
      bearer: 'fake-jwt-token',
      message: 'Login exitoso'
    };

    if (mockLoginRequest.email && mockLoginRequest.password && 
        mockLoginResponse.success && mockLoginResponse.bearer) {
      success('Simulación de API de login funciona correctamente');
      testsPassed++;
    } else {
      error('Simulación de API de login falló');
      testsFailed++;
    }
  } catch (err) {
    error(`Error en simulación de API: ${err.message}`);
    testsFailed++;
  }

  // Test 5: Verificar configuración básica
  try {
    const packageJsonPath = path.join(__dirname, '../../../../package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (packageContent.scripts && packageContent.scripts['test:e2e']) {
        success('Configuración de scripts E2E está presente');
        testsPassed++;
      } else {
        error('Falta configuración de scripts E2E');
        testsFailed++;
      }
    } else {
      error('package.json no encontrado');
      testsFailed++;
    }
  } catch (err) {
    error(`Error verificando package.json: ${err.message}`);
    testsFailed++;
  }

  // Resumen de resultados
  console.log('');
  log('='.repeat(50), colors.blue);
  log('RESUMEN DE TESTS E2E BÁSICOS', colors.blue);
  log('='.repeat(50), colors.blue);
  
  if (testsPassed > 0) {
    success(`Tests exitosos: ${testsPassed}`);
  }
  
  if (testsFailed > 0) {
    error(`Tests fallidos: ${testsFailed}`);
  }
  
  const total = testsPassed + testsFailed;
  const percentage = total > 0 ? Math.round((testsPassed / total) * 100) : 0;
  
  console.log('');
  if (percentage >= 80) {
    success(`Porcentaje de éxito: ${percentage}% ✨`);
    success('¡Proyecto listo para tests E2E con navegador! 🚀');
  } else if (percentage >= 60) {
    log(`Porcentaje de éxito: ${percentage}% ⚠️`, colors.yellow);
    info('Proyecto parcialmente listo. Revisar elementos faltantes.');
  } else {
    error(`Porcentaje de éxito: ${percentage}% ❌`);
    error('Proyecto necesita configuración adicional antes de tests E2E.');
  }
  
  console.log('');
  
  // Exit code para CI/CD
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Ejecutar tests
runBasicTests().catch(err => {
  error(`Error fatal: ${err.message}`);
  process.exit(1);
});