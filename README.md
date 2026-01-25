# Site Público Multi-Tenant

Este projeto é o **site público** de uma plataforma de imobiliárias multi-tenant. Ele consome dados do Supabase que são gerenciados por um painel administrativo separado.

## 🎯 Escopo

Este projeto **APENAS**:
- ✅ Exibe imóveis do tenant ativo
- ✅ Mostra páginas públicas (Home, Imóveis, Sobre, Contato, Favoritos)
- ✅ Aplica branding dinâmico por tenant (cores, logo, textos)
- ✅ Recebe contatos via formulário (INSERT em contacts)
- ✅ Resolve tenant automaticamente por hostname

Este projeto **NÃO**:
- ❌ Contém painel administrativo
- ❌ Permite login de usuários
- ❌ Permite edição de dados (exceto formulário de contato)
- ❌ Expõe rotas /admin

## 🏗️ Arquitetura

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Domínio Cliente   │────▶│   Site Público   │────▶│    Supabase     │
│  viafatto.com.br    │     │   (Este Projeto) │     │   (Database)    │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ TenantContext    │
                            │ - Resolve tenant │
                            │ - Filtra dados   │
                            └──────────────────┘
```

## 🔑 Resolução de Tenant

1. Usuário acessa `viafatto.com.br`
2. `TenantContext` lê `window.location.hostname`
3. Busca em `domains` onde:
   - `hostname = 'viafatto.com.br'`
   - `type = 'public'`
   - `verified = true`
4. Se encontrar, carrega o tenant e filtra todos os dados por `tenant_id`
5. Se não encontrar, exibe página "Site não configurado"

## 📁 Estrutura de Arquivos

```
src/
├── App.tsx                      # Rotas públicas apenas
├── contexts/
│   └── TenantContext.tsx        # Resolução de tenant
├── components/
│   ├── tenant/
│   │   └── PublicTenantGate.tsx # Gate de acesso público
│   ├── TemplateRenderer.tsx     # Suporte a múltiplos templates
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── hooks/
│   ├── useSupabaseData.ts       # Queries READ-ONLY com tenant_id
│   └── useTemplate.ts           # Hook para templates
└── pages/
    ├── Index.tsx                # Home
    ├── PropertiesPage.tsx       # Lista de imóveis
    ├── PropertyPage.tsx         # Detalhe do imóvel
    ├── AboutPage.tsx            # Sobre
    ├── ContactPage.tsx          # Contato
    ├── FavoritesPage.tsx        # Favoritos
    └── NotFound.tsx             # 404
```

## 🔒 Segurança

- Todas as queries filtram por `tenant_id`
- Não é possível acessar dados de outros tenants
- RLS no Supabase garante isolamento
- Não há bypass via query string

## 🎨 Templates

O sistema suporta múltiplos templates via campo `template_id` nas settings do tenant:

```tsx
import { TemplateRenderer } from '@/components/TemplateRenderer';

<TemplateRenderer
  templates={{
    default: <DefaultHero />,
    modern: <ModernHero />,
  }}
  fallback={<DefaultHero />}
/>
```

## 📊 SEO

- Title, description e OG tags dinâmicos por tenant
- URLs amigáveis: `/imovel/apartamento-3-quartos-asa-sul`
- Estrutura preparada para sitemap por tenant

## 🚀 Deploy

Este projeto deve ser deployado em domínios públicos dos clientes:
- `viafatto.com.br`
- `www.viafatto.com.br`
- `imobiliaria.exemplo.com.br`

O painel administrativo é um projeto separado acessível via:
- `painel.viafatto.com.br`

## 📡 Dados Consumidos

| Tabela | Uso |
|--------|-----|
| `tenants` | Dados do tenant |
| `domains` | Resolução por hostname |
| `site_config` | Branding, cores, textos |
| `properties` | Lista de imóveis |
| `property_images` | Fotos dos imóveis |
| `categories` | Categorias de imóveis |
| `contacts` | Formulário de contato (INSERT only) |
| `favorites` | Favoritos do usuário |

## 🔧 Desenvolvimento Local

```sh
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📦 Tecnologias

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## 📄 Licença

Projeto privado. Todos os direitos reservados.
