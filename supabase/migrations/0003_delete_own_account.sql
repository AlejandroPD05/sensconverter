-- SensConverter — the signed-in user can delete their own account.
-- Apply after 0002_preferred_profile.sql (SQL Editor or `supabase db push`).
--
-- Runs as the function owner (postgres) so it can remove the row from
-- auth.users without exposing a service-role key to the app. It only ever
-- deletes auth.uid(): the caller cannot pass another user id. profiles and
-- sensitivity_profiles reference auth.users with ON DELETE CASCADE, so the
-- user's data goes with it.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
