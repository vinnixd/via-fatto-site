# Instruções de Restauração - Via Fatto Imobiliária

## Pré-requisitos

- Ubuntu 20.04+ ou Debian 11+
- PostgreSQL 15+ instalado
- Acesso ao Supabase CLI ou conexão direta ao banco

## 1. Instalar PostgreSQL (se necessário)

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

## 2. Baixar os arquivos de backup

```bash
# Criar diretório de backup
mkdir -p ~/viafatto-backup
cd ~/viafatto-backup

# Baixar arquivos (substituir pela URL real)
wget https://via-fatto-site.lovable.app/exports/schema.sql
wget https://via-fatto-site.lovable.app/exports/tenants.csv
wget https://via-fatto-site.lovable.app/exports/domains.csv
wget https://via-fatto-site.lovable.app/exports/tenant_users.csv
wget https://via-fatto-site.lovable.app/exports/categories.csv
wget https://via-fatto-site.lovable.app/exports/site_config.csv
wget https://via-fatto-site.lovable.app/exports/contacts.csv
wget https://via-fatto-site.lovable.app/exports/portais.csv
wget https://via-fatto-site.lovable.app/exports/properties.csv
wget https://via-fatto-site.lovable.app/exports/property_images.csv
wget https://via-fatto-site.lovable.app/exports/favorites.csv
wget https://via-fatto-site.lovable.app/exports/restore.sh
```

## 3. Restaurar no Supabase (Recomendado)

### Via Supabase Dashboard:
1. Acesse https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql
2. Cole o conteúdo de `schema.sql` e execute
3. Use a função de importação CSV para cada tabela

### Via CLI:
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Conectar ao projeto
supabase link --project-ref SEU_PROJECT_ID

# Executar schema
supabase db push < schema.sql
```

## 4. Restaurar em PostgreSQL Local

```bash
# Dar permissão de execução ao script
chmod +x restore.sh

# Executar restauração
./restore.sh
```

## 5. Importar CSVs no Supabase

Para cada tabela, use o SQL Editor do Supabase:

```sql
-- Exemplo para properties (ajustar caminho do CSV)
COPY properties FROM '/path/to/properties.csv' WITH (FORMAT csv, HEADER true);
```

Ou use a interface gráfica:
1. Vá em Table Editor
2. Selecione a tabela
3. Clique em "Import data from CSV"

## Ordem de Importação (IMPORTANTE!)

Devido às foreign keys, importe na seguinte ordem:

1. `tenants.csv`
2. `domains.csv`
3. `tenant_users.csv`
4. `categories.csv`
5. `site_config.csv`
6. `properties.csv`
7. `property_images.csv`
8. `contacts.csv`
9. `favorites.csv`
10. `portais.csv`

## Dados do Tenant Via Fatto

- **Tenant ID:** `f136543f-bace-4e46-9908-d7c8e7e0982f`
- **Slug:** `viafatto`
- **Domínio:** `viafatto.com.br`

## Verificação

Após restaurar, verifique com:

```sql
SELECT COUNT(*) as total FROM properties WHERE tenant_id = 'f136543f-bace-4e46-9908-d7c8e7e0982f';
SELECT COUNT(*) as total FROM categories WHERE tenant_id = 'f136543f-bace-4e46-9908-d7c8e7e0982f';
SELECT * FROM domains WHERE tenant_id = 'f136543f-bace-4e46-9908-d7c8e7e0982f';
```

## Suporte

- **Supabase Project ID Original:** `lwxrneoeoqzlekusqgml`
- **Data do Backup:** 2026-01-26
