-- IOLSTAR panel: Supabase şeması (tek kullanıcı)
-- Supabase > SQL Editor'da çalıştırın. Birden fazla kez çalıştırmak güvenlidir.

create table if not exists public.models   (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.orders   (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.invoices (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.stock    (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.settings (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());

-- Önceki (çok kullanıcılı) sürümden kalanları temizle
do $$
declare t text;
begin
  foreach t in array array['models','orders','invoices','stock','settings'] loop
    execute format('drop policy if exists "%1$s: aktif okur" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: admin yazar" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: admin günceller" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: admin siler" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: giriş yapmış" on public.%1$s', t);
  end loop;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();
drop function if exists public.is_active();
drop table if exists public.profiles cascade;

-- Satır seviyesi güvenlik: yalnızca giriş yapmış kullanıcı (tek hesap) okuyup yazabilir
alter table public.models   enable row level security;
alter table public.orders   enable row level security;
alter table public.invoices enable row level security;
alter table public.stock    enable row level security;
alter table public.settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['models','orders','invoices','stock','settings'] loop
    execute format('create policy "%1$s: giriş yapmış" on public.%1$s for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
