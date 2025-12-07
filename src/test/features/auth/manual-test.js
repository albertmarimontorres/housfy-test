// Simple test runner para verificar las validaciones sin vitest
const { AuthService } = require('../../../services/auth.service.ts');

async function testValidations() {
  console.log('🧪 Probando validaciones de AuthService...\n');

  // Test 1: Email inválido
  try {
    await AuthService.login({ email: 'invalid-email', password: 'password123' });
    console.log('❌ FALLO: Email inválido debería lanzar error');
  } catch (error) {
    console.log('✅ PASA: Email inválido -', error.message);
  }

  // Test 2: Password corto
  try {
    await AuthService.login({ email: 'test@example.com', password: '123' });
    console.log('❌ FALLO: Password corto debería lanzar error');
  } catch (error) {
    console.log('✅ PASA: Password corto -', error.message);
  }

  // Test 3: Nombre con caracteres inválidos
  try {
    await AuthService.register({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Juan123'
    });
    console.log('❌ FALLO: Nombre con números debería lanzar error');
  } catch (error) {
    console.log('✅ PASA: Nombre inválido -', error.message);
  }

  // Test 4: String largo válido (debería pasar validación y fallar en API)
  try {
    await AuthService.login({
      email: 'test@example.com',
      password: 'password123' + 'a'.repeat(100)
    });
    console.log('❌ FALLO: Password largo debería pasar validación');
  } catch (error) {
    if (error.message.includes('Password debe tener al menos 8 caracteres')) {
      console.log('❌ FALLO: Password largo no debería fallar por longitud');
    } else {
      console.log('✅ PASA: Password largo falló en API, no en validación -', error.message);
    }
  }

  console.log('\n✨ Tests de validación completados');
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  testValidations().catch(console.error);
}

module.exports = { testValidations };