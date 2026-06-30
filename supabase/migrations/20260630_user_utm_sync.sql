-- Fonte oficial cross-device. Execute no SQL Editor do Supabase.
create table if not exists public.tracking_sites (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  domain text not null default '',
  url text,
  is_active boolean not null default false,
  measurement_id text,
  meta_pixel_id text,
  endpoint text,
  installed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibilidade caso a primeira versão JSONB da migration tenha sido executada.
alter table public.tracking_sites add column if not exists name text;
alter table public.tracking_sites add column if not exists domain text default '';
alter table public.tracking_sites add column if not exists url text;
alter table public.tracking_sites add column if not exists is_active boolean default false;
alter table public.tracking_sites add column if not exists measurement_id text;
alter table public.tracking_sites add column if not exists meta_pixel_id text;
alter table public.tracking_sites add column if not exists endpoint text;
alter table public.tracking_sites add column if not exists installed boolean default false;
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='tracking_sites' and column_name='data') then
    execute $sql$update public.tracking_sites set name=coalesce(name,data->>'name','Oferta'), url=coalesce(url,data->>'websiteUrl'),
      measurement_id=coalesce(measurement_id,data->>'measurementId'), meta_pixel_id=coalesce(meta_pixel_id,data->>'metaPixelId'),
      endpoint=coalesce(endpoint,data->>'endpoint'), installed=coalesce(installed,(data->>'installed')::boolean,false)$sql$;
    execute 'alter table public.tracking_sites alter column data drop not null';
  end if;
end $$;

create table if not exists public.utm_entries (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id uuid not null references public.tracking_sites(id) on delete cascade,
  url text not null,
  full_url text not null,
  source text not null,
  medium text not null,
  campaign text not null,
  term text,
  content text,
  clicks integer not null default 0 check (clicks >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.utm_entries add column if not exists site_id uuid;
alter table public.utm_entries add column if not exists url text;
alter table public.utm_entries add column if not exists full_url text;
alter table public.utm_entries add column if not exists source text;
alter table public.utm_entries add column if not exists medium text;
alter table public.utm_entries add column if not exists campaign text;
alter table public.utm_entries add column if not exists term text;
alter table public.utm_entries add column if not exists content text;
alter table public.utm_entries add column if not exists clicks integer default 0;
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='utm_entries' and column_name='data') then
    execute $sql$update public.utm_entries set site_id=coalesce(site_id,case when (data->>'siteId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then (data->>'siteId')::uuid else null end), url=coalesce(url,data->>'url'),
      full_url=coalesce(full_url,data->>'full'), source=coalesce(source,data->>'source'), medium=coalesce(medium,data->>'medium'),
      campaign=coalesce(campaign,data->>'campaign'), term=coalesce(term,data->>'term'), content=coalesce(content,data->>'content'),
      clicks=coalesce(clicks,(data->>'clicks')::integer,0)$sql$;
    execute 'alter table public.utm_entries alter column data drop not null';
  end if;
end $$;

create unique index if not exists utm_entries_owner_site_url_uidx on public.utm_entries(user_id, site_id, full_url);
create index if not exists tracking_sites_user_idx on public.tracking_sites(user_id, created_at desc);
create index if not exists utm_entries_user_idx on public.utm_entries(user_id, created_at desc);

alter table public.tracking_sites enable row level security;
alter table public.utm_entries enable row level security;
drop policy if exists "users manage own tracking sites" on public.tracking_sites;
drop policy if exists "users manage own utm entries" on public.utm_entries;
create policy "users manage own tracking sites" on public.tracking_sites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own utm entries" on public.utm_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
