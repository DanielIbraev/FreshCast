-- FreshCast schema. Paste into Supabase: SQL Editor -> New query -> Run.
-- Safe to run more than once.

create table if not exists ingredients (
  id text primary key,
  restaurant_id text not null default 'marcos-trattoria',
  name text not null check (char_length(name) between 1 and 80),
  category text not null check (category in ('produce','meat','seafood','dairy','bakery','dry')),
  cost_per_kg numeric not null check (cost_per_kg > 0 and cost_per_kg < 1000),
  baseline_prep_kg numeric not null check (baseline_prep_kg > 0 and baseline_prep_kg < 500),
  shelf_life_days int not null check (shelf_life_days between 1 and 365),
  co2_per_kg numeric not null check (co2_per_kg >= 0 and co2_per_kg < 100),
  created_at timestamptz not null default now()
);

-- Every tap on the Log Waste screen.
create table if not exists waste_logs (
  id text primary key,
  restaurant_id text not null default 'marcos-trattoria',
  ingredient_id text not null references ingredients(id) on delete cascade,
  quantity_kg numeric not null check (quantity_kg > 0 and quantity_kg < 200),
  reason text not null check (reason in ('overprep','spoiled','plate','dropped')),
  logged_at timestamptz not null default now()
);

-- End-of-day close-out per ingredient: what the model learns from.
-- prior_kg = forecast from industry priors, cut_kg = how much less the plan
-- told the kitchen to prep, logged_kg = what actually went in the bin.
create table if not exists daily_observations (
  restaurant_id text not null default 'marcos-trattoria',
  date date not null,
  ingredient_id text not null references ingredients(id) on delete cascade,
  prior_kg numeric not null check (prior_kg >= 0),
  cut_kg numeric not null check (cut_kg >= 0),
  logged_kg numeric not null check (logged_kg >= 0),
  weather text not null,
  covers int not null,
  primary key (restaurant_id, date, ingredient_id)
);

create index if not exists waste_logs_day on waste_logs (restaurant_id, logged_at);
create index if not exists obs_day on daily_observations (restaurant_id, date);

-- Row level security. There is no login in the hackathon build, so the public
-- key may only touch the one demo restaurant. Add Supabase Auth before real use.
alter table ingredients enable row level security;
alter table waste_logs enable row level security;
alter table daily_observations enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ingredients','waste_logs','daily_observations'] loop
    execute format('drop policy if exists demo_rw on %I', t);
    execute format(
      'create policy demo_rw on %I for all to anon using (restaurant_id = ''marcos-trattoria'') with check (restaurant_id = ''marcos-trattoria'')',
      t
    );
  end loop;
end $$;
