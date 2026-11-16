-- IOLSTAR panel: Supabase şeması
-- Supabase > SQL Editor'da bir kez çalıştırın.

-- Kullanıcı profilleri (her Auth kullanıcısının bir satırı olur)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('admin','viewer')),
  active boolean not null default false   -- yeni kullanıcı, admin onaylayana kadar pasif
);

-- Yeni Auth kullanıcısı oluşunca pasif viewer profili aç
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Yetki yardımcıları (RLS içinde kullanılır)
create or replace function public.is_active() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select active from public.profiles where id = auth.uid()), false)
$$;
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select active and role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

-- Veri tabloları: her satır bir belge (id + jsonb)
create table if not exists public.models   (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.orders   (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.invoices (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.stock    (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.settings (id text primary key, data jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());

-- Satır seviyesi güvenlik: aktif kullanıcılar okur, yalnızca admin yazar
alter table public.profiles enable row level security;
alter table public.models   enable row level security;
alter table public.orders   enable row level security;
alter table public.invoices enable row level security;
alter table public.stock    enable row level security;
alter table public.settings enable row level security;

-- Profiller: kullanıcı kendi satırını okur; admin hepsini okur ve yönetir
create policy "profil: kendi satırı" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profil: admin yönetir" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['models','orders','invoices','stock','settings'] loop
    execute format('create policy "%1$s: aktif okur" on public.%1$s for select using (public.is_active())', t);
    execute format('create policy "%1$s: admin yazar" on public.%1$s for insert with check (public.is_admin())', t);
    execute format('create policy "%1$s: admin günceller" on public.%1$s for update using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "%1$s: admin siler" on public.%1$s for delete using (public.is_admin())', t);
  end loop;
end $$;
