#!/bin/bash
#
# Script para baixar backup completo - Via Fatto Imobiliária
# Execute no VPS Ubuntu: curl -sL URL_DESTE_SCRIPT | bash
#

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="https://via-fatto-site.lovable.app/exports"
BACKUP_DIR="$HOME/viafatto-backup-$(date +%Y%m%d)"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     DOWNLOAD DE BACKUP - VIA FATTO IMOBILIÁRIA             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Criar diretório
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo -e "${YELLOW}📁 Salvando em: ${BACKUP_DIR}${NC}"
echo ""

# Lista de arquivos para baixar
FILES=(
    "schema.sql"
    "tenants.csv"
    "domains.csv"
    "tenant_users.csv"
    "categories.csv"
    "site_config.csv"
    "properties.csv"
    "property_images.csv"
    "contacts.csv"
    "favorites.csv"
    "portais.csv"
    "restore.sh"
    "INSTRUCOES_RESTAURACAO.md"
)

echo -e "${YELLOW}📥 Baixando arquivos...${NC}"
echo ""

for file in "${FILES[@]}"; do
    echo -n "   Baixando ${file}... "
    if curl -sLO "${BASE_URL}/${file}"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}(não encontrado)${NC}"
    fi
done

# Tornar scripts executáveis
chmod +x restore.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ DOWNLOAD CONCLUÍDO!                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Arquivos salvos em: ${YELLOW}${BACKUP_DIR}${NC}"
echo ""
echo -e "Próximos passos:"
echo -e "  1. ${YELLOW}cd ${BACKUP_DIR}${NC}"
echo -e "  2. ${YELLOW}cat INSTRUCOES_RESTAURACAO.md${NC}"
echo -e "  3. ${YELLOW}./restore.sh DATABASE_URL${NC}"
echo ""
