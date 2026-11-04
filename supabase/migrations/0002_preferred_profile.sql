-- SensConverter — one preferred profile per game.
-- Apply after 0001_init.sql.

alter table public.sensitivity_profiles
  add column if not exists is_preferred boolean not null default false;

create unique index if not exists sensitivity_profiles_preferred_per_game_idx
  on public.sensitivity_profiles (user_id, game_id)
  where is_preferred;

grant select, insert, update, delete on public.sensitivity_profiles to authenticated;
