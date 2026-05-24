create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text,
  source      text default 'landing',
  referrer    text,
  created_at  timestamptz not null default now()
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- Lock down to service role only. Inserts and reads must go through the API route.
alter table public.waitlist enable row level security;
