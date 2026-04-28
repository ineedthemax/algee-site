-- Fan purchases table (run in Supabase SQL editor)
create table if not exists fan_purchases (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade,
  tier_id          uuid references release_tiers(id) on delete cascade,
  release_id       uuid references releases(id) on delete cascade,
  stripe_session_id text,
  amount_paid      numeric(10,2) default 0,
  status           text default 'complete',
  created_at       timestamptz default now(),
  unique(user_id, tier_id)
);

-- RLS
alter table fan_purchases enable row level security;

drop policy if exists "users view own purchases" on fan_purchases;
create policy "users view own purchases"
  on fan_purchases for select
  using (auth.uid() = user_id);
