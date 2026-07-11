-- Interest a family submits from the (unlocked) provider directory. Writes are
-- gated by RLS + a server-side access re-check; policies live in the rls_grants
-- migration.
create table public.provider_interest (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null references public.providers (key),
  name text not null,
  email text not null,
  note text not null default '',
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index provider_interest_created_by_idx on public.provider_interest (created_by);
