#!/bin/bash
#
# Script de Restauração - Via Fatto Imobiliária
# Uso: ./restore.sh [DATABASE_URL]
#
# Exemplo:
#   ./restore.sh "postgresql://postgres:senha@localhost:5432/viafatto"
#   ./restore.sh "postgresql://postgres:senha@db.mpsusvpdjuqvjgdsvwpp.supabase.co:5432/postgres"
#

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     RESTAURAÇÃO DE BACKUP - VIA FATTO IMOBILIÁRIA          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se DATABASE_URL foi fornecido
if [ -z "$1" ]; then
    echo -e "${YELLOW}Uso: ./restore.sh DATABASE_URL${NC}"
    echo ""
    echo "Exemplos:"
    echo "  ./restore.sh 'postgresql://postgres:senha@localhost:5432/viafatto'"
    echo "  ./restore.sh 'postgresql://postgres:senha@db.PROJECT.supabase.co:5432/postgres'"
    echo ""
    read -p "Digite a DATABASE_URL: " DATABASE_URL
else
    DATABASE_URL=$1
fi

# Diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}📁 Diretório de trabalho: ${SCRIPT_DIR}${NC}"
echo ""

# Verificar arquivos necessários
echo -e "${YELLOW}🔍 Verificando arquivos de backup...${NC}"

REQUIRED_FILES=(
    "schema.sql"
    "tenants.csv"
    "domains.csv"
    "categories.csv"
    "site_config.csv"
    "properties.csv"
    "property_images.csv"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "${SCRIPT_DIR}/${file}" ]; then
        echo -e "${RED}   ✗ ${file} não encontrado${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        echo -e "${GREEN}   ✓ ${file}${NC}"
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Faltam ${MISSING_FILES} arquivo(s). Abortando.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO: Este script irá modificar o banco de dados.${NC}"
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Operação cancelada.${NC}"
    exit 1
fi

# Função para executar SQL
run_sql() {
    psql "$DATABASE_URL" -c "$1"
}

# Função para importar CSV
import_csv() {
    local table=$1
    local file=$2
    echo -e "${YELLOW}   Importando ${table}...${NC}"
    
    # Usar \copy para importar CSV (funciona com conexões remotas)
    psql "$DATABASE_URL" -c "\copy ${table} FROM '${SCRIPT_DIR}/${file}' WITH (FORMAT csv, HEADER true, NULL '')"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✓ ${table} importado${NC}"
    else
        echo -e "${RED}   ✗ Erro ao importar ${table}${NC}"
    fi
}

echo ""
echo -e "${YELLOW}📥 Iniciando restauração...${NC}"
echo ""

# 1. Executar schema (criar estrutura)
echo -e "${YELLOW}1️⃣  Criando estrutura do banco...${NC}"
psql "$DATABASE_URL" < "${SCRIPT_DIR}/schema.sql" 2>/dev/null || echo -e "${YELLOW}   (Estrutura pode já existir)${NC}"

# 2. Limpar dados existentes do tenant (opcional)
echo ""
echo -e "${YELLOW}2️⃣  Limpando dados antigos do tenant...${NC}"
TENANT_ID="f136543f-bace-4e46-9908-d7c8e7e0982f"

run_sql "DELETE FROM property_images WHERE property_id IN (SELECT id FROM properties WHERE tenant_id = '${TENANT_ID}');" 2>/dev/null || true
run_sql "DELETE FROM favorites WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM contacts WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM portais WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM properties WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM categories WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM site_config WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM tenant_users WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM domains WHERE tenant_id = '${TENANT_ID}';" 2>/dev/null || true
run_sql "DELETE FROM tenants WHERE id = '${TENANT_ID}';" 2>/dev/null || true

echo -e "${GREEN}   ✓ Dados antigos removidos${NC}"

# 3. Importar CSVs na ordem correta
echo ""
echo -e "${YELLOW}3️⃣  Importando dados...${NC}"

import_csv "tenants" "tenants.csv"
import_csv "domains" "domains.csv"

if [ -f "${SCRIPT_DIR}/tenant_users.csv" ]; then
    import_csv "tenant_users" "tenant_users.csv"
fi

import_csv "categories" "categories.csv"
import_csv "site_config" "site_config.csv"
import_csv "properties" "properties.csv"
import_csv "property_images" "property_images.csv"

if [ -f "${SCRIPT_DIR}/contacts.csv" ]; then
    import_csv "contacts" "contacts.csv"
fi

if [ -f "${SCRIPT_DIR}/favorites.csv" ]; then
    import_csv "favorites" "favorites.csv"
fi

if [ -f "${SCRIPT_DIR}/portais.csv" ]; then
    import_csv "portais" "portais.csv"
fi

# 4. Verificar restauração
echo ""
echo -e "${YELLOW}4️⃣  Verificando restauração...${NC}"

echo ""
psql "$DATABASE_URL" -c "
SELECT 'tenants' as tabela, COUNT(*) as registros FROM tenants WHERE id = '${TENANT_ID}'
UNION ALL
SELECT 'domains', COUNT(*) FROM domains WHERE tenant_id = '${TENANT_ID}'
UNION ALL
SELECT 'properties', COUNT(*) FROM properties WHERE tenant_id = '${TENANT_ID}'
UNION ALL
SELECT 'categories', COUNT(*) FROM categories WHERE tenant_id = '${TENANT_ID}'
UNION ALL
SELECT 'site_config', COUNT(*) FROM site_config WHERE tenant_id = '${TENANT_ID}';
"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ RESTAURAÇÃO CONCLUÍDA!                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Tenant ID: ${YELLOW}${TENANT_ID}${NC}"
echo -e "Database:  ${YELLOW}${DATABASE_URL}${NC}"
echo ""
