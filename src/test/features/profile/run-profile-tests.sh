#!/bin/bash

# Script para ejecutar tests de la feature Profile
echo "🔍 Ejecutando tests de Profile..."
echo "========================================="

# Ejecutar todos los tests de profile
echo "📋 Ejecutando todos los tests de profile..."
npx vitest run src/test/features/profile/ --reporter=verbose

echo ""
echo "🎯 Ejecutando tests individuales..."
echo "-----------------------------------"

# Tests básicos
echo "✅ Tests básicos (profile.simple.test.ts):"
npx vitest run src/test/features/profile/profile.simple.test.ts --reporter=basic

echo ""
# Tests de API
echo "🌐 Tests de API (profile.api.test.ts):"
npx vitest run src/test/features/profile/profile.api.test.ts --reporter=basic

echo ""
# Tests de Service
echo "⚙️ Tests de Service (profile.service.test.ts):"
npx vitest run src/test/features/profile/profile.service.test.ts --reporter=basic

echo ""
# Tests de Store
echo "📦 Tests de Store (profile.store.test.ts):"
npx vitest run src/test/features/profile/profile.store.test.ts --reporter=basic

echo ""
# Tests de Validation
echo "✔️ Tests de Validation (profile.validation.test.ts):"
npx vitest run src/test/features/profile/profile.validation.test.ts --reporter=basic

echo ""
# Tests de Integration
echo "🔗 Tests de Integration (profile.integration.test.ts):"
npx vitest run src/test/features/profile/profile.integration.test.ts --reporter=basic

echo ""
echo "📊 Coverage de Profile..."
echo "========================"
npx vitest run src/test/features/profile/ --coverage --coverage.include="src/api/modules/profile.api.ts" --coverage.include="src/services/profile.service.ts" --coverage.include="src/stores/profile.store.ts"

echo ""
echo "✅ Tests de Profile completados!"
echo "================================"