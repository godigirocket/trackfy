# Trackfy — Meta Ads Manager

Dashboard SaaS premium para gestão de campanhas Meta Ads com IA integrada.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + Design System próprio com CSS Variables
- **Supabase** (Auth + PostgreSQL)
- **Zustand** (estado global)
- **Recharts** (gráficos)
- **Gemini AI** (assistente)

## Início rápido

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Configuração

### 1. Supabase

Execute o SQL em `supabase/reset_and_setup.sql` no SQL Editor do painel Supabase.

No painel Supabase:
- **Authentication → Providers → Email** → desmarcar "Confirm email"

### 2. Variáveis de ambiente

Edite `.env.local`:

```env
# Gemini AI (opcional)
GEMINI_API_KEY=sua_chave_aqui
```

### 3. Credenciais Meta Ads

Configure em **Dashboard → Configurações → Meta Ads**:
- Access Token (long-lived)
- Ad Account ID (sem o prefixo `act_`)

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Login / Registro |
| `/dashboard` | Dashboard principal |
| `/dashboard/resumo` | Resumo consolidado |
| `/dashboard/campaigns` | Gerenciador Meta Ads |
| `/dashboard/creatives` | Hub de Criativos |
| `/dashboard/google` | Google Ads |
| `/dashboard/tiktok` | TikTok Analytics |
| `/dashboard/utms` | Gerador de UTMs |
| `/dashboard/rules` | Automações |
| `/dashboard/taxas` | Taxas e impostos |
| `/dashboard/finance` | Financeiro |
| `/dashboard/relatorios` | Relatórios |
| `/dashboard/profile` | Perfil |
| `/dashboard/settings` | Configurações |
| `/dashboard/notifications` | Notificações |

## Design System

O projeto usa CSS Variables para theming consistente:

```css
--bg, --surface, --border   /* Superfícies */
--text-1 → --text-4         /* Hierarquia de texto */
--blue, --green, --red       /* Cores de status */
--r-sm → --r-2xl             /* Border radius */
--shadow-xs → --shadow-xl    /* Sombras */
```

Classes utilitárias: `.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input`, `.select`, `.badge-*`, `.nav-item`
