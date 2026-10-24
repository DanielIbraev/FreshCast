-- FreshCast security: public visitors can READ the demo, only the owner can WRITE.
-- Paste into Supabase SQL Editor and Run. Replace REPLACE_WITH_ADMIN_TOKEN first
-- (or run supabase/security.local.sql, which has your real token and is gitignored).

-- 1. A private place for the admin token. The 'private' schema is not exposed by the API.
create schema if not exists private;
revoke all on schema private from anon, authenticated;
create table if not exists private.settings (key text primary key, value text not null);
insert into private.settings (key, value) values ('admin_token', 'REPLACE_WITH_ADMIN_TOKEN')
  on conflict (key) do update set value = excluded.value;

-- 2. True only when the request carries the right x-admin-token header.
--    SECURITY DEFINER lets it read private.settings without exposing the table.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (current_setting('request.headers', true)::json ->> 'x-admin-token')
      = (select value from private.settings where key = 'admin_token'),
    false)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Replace the old read/write-for-everyone policy.
do $$
declare t text;
begin
  foreach t in array array['ingredients','waste_logs','daily_observations'] loop
    execute format('drop policy if exists demo_rw on %I', t);
    execute format('drop policy if exists public_read on %I', t);
    execute format('drop policy if exists admin_write on %I', t);
    execute format('create policy public_read on %I for select to anon using (restaurant_id = ''marcos-trattoria'')', t);
    execute format(
      'create policy admin_write on %I for all to anon using (public.is_admin() and restaurant_id = ''marcos-trattoria'') with check (public.is_admin() and restaurant_id = ''marcos-trattoria'')',
      t);
  end loop;
end $$;

-- 4. Pilot sign-ups: anyone can add one, only the admin can read them.
create table if not exists pilot_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  restaurant text not null check (char_length(restaurant) between 1 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  city text check (char_length(city) <= 80),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);
alter table pilot_signups enable row level security;
drop policy if exists signup_insert on pilot_signups;
create policy signup_insert on pilot_signups for insert to anon with check (true);
drop policy if exists signup_admin_read on pilot_signups;
create policy signup_admin_read on pilot_signups for select to anon using (public.is_admin());
