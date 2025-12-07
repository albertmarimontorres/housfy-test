#!/bin/bash

# Test runner para Auth con coverage detallado
# Uso: ./run-auth-tests.sh

echo "🚀 Ejecutando tests de autenticación con coverage..."
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar separador
separator() {
    echo "======================================================================================================"
}

# Limpiar coverage anterior
echo "🧹 Limpiando coverage anterior..."
rm -rf coverage/

separator

# Ejecutar tests con coverage
echo "📊 Ejecutando tests con coverage..."
npm run test src/test/features/auth/ --coverage --reporter=verbose

TESTS_EXIT_CODE=$?

separator

if [ $TESTS_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Tests ejecutados exitosamente${NC}"
else
    echo -e "${RED}❌ Algunos tests fallaron${NC}"
    exit 1
fi

# Verificar si existe el reporte de coverage
if [ -f "coverage/coverage-summary.json" ]; then
    echo "📈 Analizando coverage..."
    
    # Mostrar resumen de coverage
    echo ""
    echo "📋 RESUMEN DE COVERAGE:"
    echo "======================"
    cat coverage/coverage-summary.json | jq -r '
        .total | 
        "📊 GLOBAL:",
        "  Statements: " + (.statements.pct | tostring) + "%",
        "  Branches:   " + (.branches.pct | tostring) + "%", 
        "  Functions:  " + (.functions.pct | tostring) + "%",
        "  Lines:      " + (.lines.pct | tostring) + "%"
    '
    
    # Verificar objetivos de coverage
    STATEMENTS_PCT=$(cat coverage/coverage-summary.json | jq '.total.statements.pct')
    BRANCHES_PCT=$(cat coverage/coverage-summary.json | jq '.total.branches.pct')
    FUNCTIONS_PCT=$(cat coverage/coverage-summary.json | jq '.total.functions.pct')
    LINES_PCT=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    
    separator
    echo "🎯 VERIFICANDO OBJETIVOS DE COVERAGE:"
    echo "====================================="
    
    # Función para verificar coverage
    check_coverage() {
        local metric=$1
        local actual=$2
        local target=$3
        local core_target=$4
        
        if (( $(echo "$actual >= $target" | bc -l) )); then
            if (( $(echo "$actual >= $core_target" | bc -l) )); then
                echo -e "${GREEN}✅ $metric: $actual% (EXCELENTE - ≥${core_target}%)${NC}"
            else
                echo -e "${GREEN}✅ $metric: $actual% (CUMPLE - ≥${target}%)${NC}"
            fi
            return 0
        else
            echo -e "${RED}❌ $metric: $actual% (FALLA - necesita ≥${target}%)${NC}"
            return 1
        fi
    }
    
    # Verificar cada métrica
    ALL_PASSED=true
    
    check_coverage "Statements" "$STATEMENTS_PCT" "80" "90" || ALL_PASSED=false
    check_coverage "Branches" "$BRANCHES_PCT" "80" "90" || ALL_PASSED=false  
    check_coverage "Functions" "$FUNCTIONS_PCT" "95" "100" || ALL_PASSED=false
    check_coverage "Lines" "$LINES_PCT" "80" "90" || ALL_PASSED=false
    
    separator
    
    if [ "$ALL_PASSED" = true ]; then
        echo -e "${GREEN}🎉 ¡TODOS LOS OBJETIVOS DE COVERAGE CUMPLIDOS!${NC}"
        echo ""
        echo "📁 Reportes generados en:"
        echo "  - coverage/index.html (reporte HTML detallado)"
        echo "  - coverage/lcov.info (formato LCOV)"
        echo "  - coverage/coverage-summary.json (resumen JSON)"
        echo ""
        echo "🌐 Para ver el reporte detallado:"
        echo "  open coverage/index.html"
        exit 0
    else
        echo -e "${RED}❌ OBJETIVOS DE COVERAGE NO CUMPLIDOS${NC}"
        echo ""
        echo -e "${YELLOW}💡 Para mejorar el coverage:${NC}"
        echo "  1. Revisa el reporte HTML: open coverage/index.html"
        echo "  2. Identifica líneas no cubiertas"
        echo "  3. Agrega tests para casos faltantes"
        echo "  4. Enfócate en funciones core (AuthService.*)"
        exit 1
    fi
    
else
    echo -e "${YELLOW}⚠️  No se encontró reporte de coverage${NC}"
    echo "Verifica que vitest esté configurado con coverage habilitado"
    exit 1
fi