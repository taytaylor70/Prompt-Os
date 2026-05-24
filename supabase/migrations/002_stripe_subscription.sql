-- Adds Stripe subscription tracking to public.users
alter table public.users
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_renews_at         timestamptz,
  add column if not exists plan_cancel_at_period_end boolean not null default false;

create index if not exists users_stripe_customer_id_idx     on public.users (stripe_customer_id);
create index if not exists users_stripe_subscription_id_idx on public.users (stripe_subscription_id);
