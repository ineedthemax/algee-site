-- Smart Links: ForeverFan-style multi-DSP links with analytics
-- Run this in Supabase SQL Editor

create table if not exists smart_links (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  artist       text default 'Algee',
  subtext      text,
  cover_art_url text,
  theme        text default 'dark',
  type         text default 'streaming',
  active       boolean default true,
  goes_live_at  timestamptz,
  view_count   bigint default 0,
  created_at   timestamptz default now()
);

create table if not exists smart_link_destinations (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid references smart_links(id) on delete cascade,
  platform   text not null,
  url        text not null,
  sort_order integer default 0,
  click_count bigint default 0
);

-- RLS
alter table smart_links enable row level security;
alter table smart_link_destinations enable row level security;

create policy "Anyone can read active smart links"
  on smart_links for select using (active = true);

create policy "Service role full access on smart_links"
  on smart_links using (true) with check (true);

create policy "Anyone can read destinations"
  on smart_link_destinations for select using (true);

create policy "Service role full access on destinations"
  on smart_link_destinations using (true) with check (true);
