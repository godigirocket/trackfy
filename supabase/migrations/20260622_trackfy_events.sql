-- Eventos recebidos pelo script nativo do Trackfy. Execute uma única vez no
-- SQL Editor do projeto Supabase usado pelo backend do Trackfy.
create table if not exists public.trackfy_events (
  id uuid primary key default gen_random_uuid(),
  site_id text not null,
  event_name text not null,
  event_id text,
  page_path text not null,
  page_url text,
  referrer text,
  source text not null default 'direct',
  medium text not null default 'direct',
  campaign text not null default '(not set)',
  term text,
  content text,
  channel text not null default 'unknown',
  value numeric,
  currency text default 'BRL',
  created_at timestamptz not null default now()
);

alter table public.trackfy_events add column if not exists page_url text;

create unique index if not exists trackfy_events_purchase_dedupe
  on public.trackfy_events (site_id, event_id)
  where event_name = 'purchase' and event_id is not null;
create index if not exists trackfy_events_site_created_idx
  on public.trackfy_events (site_id, created_at desc);

alter table public.trackfy_events enable row level security;
-- Nenhuma policy pública: somente a API server-side, autenticada com a
-- SUPABASE_SERVICE_ROLE_KEY, grava e consulta os eventos.

create table if not exists public.trackfy_orders (
  id uuid primary key default gen_random_uuid(),
  site_id text not null,
  transaction_id text not null,
  status text not null check (status in ('paid', 'refunded', 'pending')),
  value numeric not null check (value >= 0),
  currency text not null default 'BRL',
  product text,
  source text not null default 'direct',
  medium text not null default 'direct',
  campaign text not null default '(not set)',
  channel text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, transaction_id)
);
create index if not exists trackfy_orders_site_updated_idx on public.trackfy_orders (site_id, updated_at desc);
alter table public.trackfy_orders enable row level security;

create table if not exists public.trackfy_utms (
  id uuid primary key,
  site_id text not null,
  url text not null,
  source text not null,
  medium text not null,
  campaign text not null,
  term text,
  content text,
  full_url text not null,
  created_at timestamptz not null default now()
);
create index if not exists trackfy_utms_site_created_idx on public.trackfy_utms (site_id, created_at desc);
create unique index if not exists trackfy_utms_site_full_unique_idx on public.trackfy_utms (site_id, full_url);
alter table public.trackfy_utms enable row level security;
