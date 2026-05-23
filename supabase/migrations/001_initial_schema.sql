-- ─────────────────────────────────────────────────────────────────────────────
-- Prompt OS — Initial Database Schema
-- Run via: supabase db push  OR  paste into Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm"; -- for fast text search

-- ─── Types ───────────────────────────────────────────────────────────────────

create type prompt_category as enum (
  'coding', 'writing', 'analysis', 'marketing', 'research',
  'education', 'productivity', 'creative', 'business', 'data', 'other'
);

create type target_model as enum (
  'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo',
  'claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku',
  'gemini-1.5-pro', 'llama-3.1-70b', 'mistral-large', 'any'
);

create type output_type as enum (
  'text', 'json', 'code', 'markdown', 'list', 'table', 'email', 'other'
);

create type tone_type as enum (
  'professional', 'casual', 'technical', 'creative',
  'formal', 'friendly', 'authoritative', 'concise'
);

-- ─── Users (extends auth.users) ──────────────────────────────────────────────

create table if not exists public.users (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null,
  display_name  text,
  avatar_url    text,
  plan          text        not null default 'free', -- 'free' | 'pro' | 'team'
  stripe_customer_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Categories ──────────────────────────────────────────────────────────────

create table if not exists public.categories (
  id          uuid          primary key default gen_random_uuid(),
  name        text          not null unique,
  slug        prompt_category not null unique,
  icon        text,
  description text,
  created_at  timestamptz   not null default now()
);

-- Seed categories
insert into public.categories (name, slug, icon, description) values
  ('Coding',       'coding',       '💻', 'Programming, debugging, code generation'),
  ('Writing',      'writing',      '✍️', 'Copywriting, essays, creative content'),
  ('Analysis',     'analysis',     '🔍', 'Data analysis, research synthesis'),
  ('Marketing',    'marketing',    '📣', 'Campaigns, copy, brand strategy'),
  ('Research',     'research',     '🔬', 'Literature review, survey design'),
  ('Education',    'education',    '🎓', 'Teaching, explaining, tutoring'),
  ('Productivity', 'productivity', '⚡', 'Workflows, automation, planning'),
  ('Creative',     'creative',     '🎨', 'Storytelling, ideation, art direction'),
  ('Business',     'business',     '💼', 'Strategy, ops, professional comms'),
  ('Data',         'data',         '📊', 'SQL, pipelines, data transformation'),
  ('Other',        'other',        '🗂️', 'Miscellaneous prompts')
on conflict (slug) do nothing;

-- ─── Tags ────────────────────────────────────────────────────────────────────

create table if not exists public.tags (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null unique,
  slug       text        not null unique,
  color      text        default '#7c3aed',
  created_at timestamptz not null default now()
);

-- ─── Prompts ─────────────────────────────────────────────────────────────────

create table if not exists public.prompts (
  id           uuid             primary key default gen_random_uuid(),
  user_id      uuid             not null references auth.users(id) on delete cascade,
  title        text             not null,
  description  text,
  prompt_text  text             not null,
  category     prompt_category  not null default 'other',
  target_model target_model     not null default 'any',
  output_type  output_type      not null default 'text',
  tone         tone_type        not null default 'professional',
  score        integer          check (score >= 0 and score <= 100),
  is_favorite  boolean          not null default false,
  is_public    boolean          not null default false,
  created_at   timestamptz      not null default now(),
  updated_at   timestamptz      not null default now()
);

-- Full-text search index
create index if not exists prompts_search_idx
  on public.prompts using gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(prompt_text, ''))
  );

create index if not exists prompts_user_id_idx      on public.prompts (user_id);
create index if not exists prompts_category_idx     on public.prompts (category);
create index if not exists prompts_target_model_idx on public.prompts (target_model);
create index if not exists prompts_score_idx        on public.prompts (score desc);
create index if not exists prompts_created_at_idx   on public.prompts (created_at desc);

-- ─── Prompt Tags (junction) ───────────────────────────────────────────────────

create table if not exists public.prompt_tags (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  tag_id    uuid not null references public.tags(id)    on delete cascade,
  primary key (prompt_id, tag_id)
);

-- ─── Prompt Versions ─────────────────────────────────────────────────────────

create table if not exists public.prompt_versions (
  id             uuid        primary key default gen_random_uuid(),
  prompt_id      uuid        not null references public.prompts(id) on delete cascade,
  user_id        uuid        not null references auth.users(id)     on delete cascade,
  prompt_text    text        not null,
  version_number integer     not null,
  change_note    text,
  created_at     timestamptz not null default now(),
  unique (prompt_id, version_number)
);

create index if not exists prompt_versions_prompt_id_idx on public.prompt_versions (prompt_id, version_number desc);

-- ─── Prompt Scores ───────────────────────────────────────────────────────────

create table if not exists public.prompt_scores (
  id                  uuid        primary key default gen_random_uuid(),
  prompt_id           uuid        not null references public.prompts(id) on delete cascade,
  total               integer     not null check (total >= 0 and total <= 100),
  clarity             integer     not null check (clarity >= 0 and clarity <= 100),
  specificity         integer     not null check (specificity >= 0 and specificity <= 100),
  context             integer     not null check (context >= 0 and context <= 100),
  output_control      integer     not null check (output_control >= 0 and output_control <= 100),
  reusability         integer     not null check (reusability >= 0 and reusability <= 100),
  model_compatibility integer     not null check (model_compatibility >= 0 and model_compatibility <= 100),
  safety              integer     not null check (safety >= 0 and safety <= 100),
  commercial_value    integer     not null check (commercial_value >= 0 and commercial_value <= 100),
  recommendations     text[]      not null default '{}',
  created_at          timestamptz not null default now()
);

create index if not exists prompt_scores_prompt_id_idx on public.prompt_scores (prompt_id, created_at desc);

-- ─── User Settings ───────────────────────────────────────────────────────────

create table if not exists public.user_settings (
  user_id               uuid        primary key references auth.users(id) on delete cascade,
  default_model         target_model not null default 'gpt-4o',
  default_tone          tone_type    not null default 'professional',
  default_output_type   output_type  not null default 'text',
  theme                 text         not null default 'dark' check (theme in ('dark', 'light', 'system')),
  email_notifications   boolean      not null default true,
  updated_at            timestamptz  not null default now()
);

-- ─── Analytics Events ────────────────────────────────────────────────────────

create table if not exists public.analytics_events (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references auth.users(id) on delete set null,
  event_name  text        not null,
  properties  jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists analytics_events_user_id_idx   on public.analytics_events (user_id);
create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);

-- ─── Triggers ────────────────────────────────────────────────────────────────

-- Auto-update updated_at on row changes
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prompts_updated_at
  before update on public.prompts
  for each row execute procedure public.handle_updated_at();

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

-- Auto-create user record on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-version prompts when prompt_text changes
create or replace function public.handle_prompt_version()
returns trigger language plpgsql as $$
declare
  v_max integer;
begin
  if old.prompt_text is distinct from new.prompt_text then
    select coalesce(max(version_number), 0) into v_max
    from public.prompt_versions
    where prompt_id = new.id;

    insert into public.prompt_versions (prompt_id, user_id, prompt_text, version_number)
    values (new.id, new.user_id, old.prompt_text, v_max + 1);
  end if;
  return new;
end;
$$;

create trigger prompts_version_on_update
  before update on public.prompts
  for each row execute procedure public.handle_prompt_version();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.users           enable row level security;
alter table public.prompts         enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.prompt_scores   enable row level security;
alter table public.prompt_tags     enable row level security;
alter table public.tags            enable row level security;
alter table public.categories      enable row level security;
alter table public.user_settings   enable row level security;
alter table public.analytics_events enable row level security;

-- users
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- prompts
create policy "prompts_select_own_or_public" on public.prompts
  for select using (auth.uid() = user_id or is_public = true);
create policy "prompts_insert_own" on public.prompts
  for insert with check (auth.uid() = user_id);
create policy "prompts_update_own" on public.prompts
  for update using (auth.uid() = user_id);
create policy "prompts_delete_own" on public.prompts
  for delete using (auth.uid() = user_id);

-- prompt_versions
create policy "versions_select_own" on public.prompt_versions
  for select using (auth.uid() = user_id);
create policy "versions_insert_own" on public.prompt_versions
  for insert with check (auth.uid() = user_id);

-- prompt_scores
create policy "scores_select_own" on public.prompt_scores for select
  using (exists (select 1 from public.prompts p where p.id = prompt_id and (p.user_id = auth.uid() or p.is_public)));
create policy "scores_insert_own" on public.prompt_scores for insert
  with check (exists (select 1 from public.prompts p where p.id = prompt_id and p.user_id = auth.uid()));

-- prompt_tags
create policy "prompt_tags_select" on public.prompt_tags for select using (true);
create policy "prompt_tags_insert_own" on public.prompt_tags for insert
  with check (exists (select 1 from public.prompts p where p.id = prompt_id and p.user_id = auth.uid()));
create policy "prompt_tags_delete_own" on public.prompt_tags for delete
  using (exists (select 1 from public.prompts p where p.id = prompt_id and p.user_id = auth.uid()));

-- tags (public read, any auth user can create)
create policy "tags_select" on public.tags for select using (true);
create policy "tags_insert" on public.tags for insert with check (auth.uid() is not null);

-- categories (public read)
create policy "categories_select" on public.categories for select using (true);

-- user_settings
create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_upsert_own" on public.user_settings for all    using (auth.uid() = user_id);

-- analytics_events
create policy "analytics_insert" on public.analytics_events
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "analytics_select_own" on public.analytics_events
  for select using (auth.uid() = user_id);
