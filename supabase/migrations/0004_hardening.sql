-- SensConverter — hardening after the 2026-11 security review.
-- Apply after 0003_delete_own_account.sql. Idempotent.

-- 1. Fixed search_path on every function (Supabase advisor:
--    function_search_path_mutable). Security definer functions resolve names
--    only through fully qualified references.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger functions are never meant to be called through the API.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- 2. Per-user cap on saved profiles. The API lets an authenticated user insert
--    directly (RLS only checks ownership), so the limit lives in the database
--    instead of the server action.

create or replace function public.enforce_profile_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  total integer;
begin
  select count(*) into total
  from public.sensitivity_profiles
  where user_id = new.user_id;

  if total >= 200 then
    raise exception 'profile limit reached' using errcode = 'P0001',
      hint = 'Cada cuenta puede guardar hasta 200 perfiles.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_profile_limit() from public, anon, authenticated;

drop trigger if exists sensitivity_profiles_limit on public.sensitivity_profiles;
create trigger sensitivity_profiles_limit
  before insert on public.sensitivity_profiles
  for each row execute function public.enforce_profile_limit();
