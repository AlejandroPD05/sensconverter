-- SensConverter — initial schema
-- Run this in the Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 60),
  default_dpi numeric(8, 2) check (default_dpi is null or (default_dpi >= 1 and default_dpi <= 32000)),
  global_cm360 numeric(7, 3) check (global_cm360 is null or (global_cm360 >= 1 and global_cm360 <= 200)),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sensitivity_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  game_id text not null check (char_length(game_id) between 1 and 60),
  dpi numeric(8, 2) not null check (dpi >= 1 and dpi <= 32000),
  sensitivity numeric(12, 6) not null check (sensitivity > 0),
  fov numeric(5, 2) check (fov is null or (fov > 0 and fov < 180)),
  method text not null check (method in ('cm360', 'fov-aware', 'monitor-distance', 'game-specific')),
  cm360 numeric(9, 4) check (cm360 is null or cm360 > 0),
  notes text check (notes is null or char_length(notes) <= 500),
  is_favorite boolean not null default false,
  is_preferred boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists sensitivity_profiles_user_id_idx
  on public.sensitivity_profiles (user_id);

create index if not exists sensitivity_profiles_user_game_idx
  on public.sensitivity_profiles (user_id, game_id);

create index if not exists sensitivity_profiles_favorite_idx
  on public.sensitivity_profiles (user_id, is_favorite);

create unique index if not exists sensitivity_profiles_preferred_per_game_idx
  on public.sensitivity_profiles (user_id, game_id)
  where is_preferred;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists sensitivity_profiles_set_updated_at on public.sensitivity_profiles;
create trigger sensitivity_profiles_set_updated_at
  before update on public.sensitivity_profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.sensitivity_profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

drop policy if exists "sensitivity_profiles_select_own" on public.sensitivity_profiles;
create policy "sensitivity_profiles_select_own"
  on public.sensitivity_profiles for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "sensitivity_profiles_insert_own" on public.sensitivity_profiles;
create policy "sensitivity_profiles_insert_own"
  on public.sensitivity_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "sensitivity_profiles_update_own" on public.sensitivity_profiles;
create policy "sensitivity_profiles_update_own"
  on public.sensitivity_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "sensitivity_profiles_delete_own" on public.sensitivity_profiles;
create policy "sensitivity_profiles_delete_own"
  on public.sensitivity_profiles for delete
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.profiles from anon;
revoke all on public.sensitivity_profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.sensitivity_profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
