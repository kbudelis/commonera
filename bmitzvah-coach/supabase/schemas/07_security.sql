-- RLS, privilege grants, and policies. pg-delta materialises the declarative
-- schema into a shadow database and diffs it, so the revoke/grant/enable-rls/
-- create-policy statements here define the desired access state and round-trip
-- through `supabase db schema declarative sync` like any other object.
--
-- Access model:
--   reference/catalog tables  -> public read (anon + authenticated), no writes
--   profiles                  -> read own + own children; insert self (parent);
--                                update own display_name only
--   journeys                  -> read own or as parent; insert own; permanent
--                                (no update/delete)
--   milestones / activities / -> read if you can view the journey; write if you
--   celebration_plans            own it
--   provider_interest         -> insert/read own (directory gate re-checked in
--                                the server function)

-- ---------------------------------------------------------------------------
-- Security-definer helper grants. Revoke the implicit PUBLIC execute, then hand
-- it only to authenticated so anon cannot call these RLS shortcuts.
-- ---------------------------------------------------------------------------
revoke all on function public.is_parent_of(uuid) from public;
revoke all on function public.owns_journey(uuid) from public;
revoke all on function public.can_view_journey(uuid) from public;
grant execute on function public.is_parent_of(uuid) to authenticated;
grant execute on function public.owns_journey(uuid) to authenticated;
grant execute on function public.can_view_journey(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Reference catalog: read-only public content. RLS on, select granted to the
-- Data API roles, a single permissive read policy, and no write grants.
-- ---------------------------------------------------------------------------
alter table public.templates enable row level security;
alter table public.template_milestones enable row level security;
alter table public.activity_prompts enable row level security;
alter table public.providers enable row level security;
alter table public.provider_testimonials enable row level security;
alter table public.provider_templates enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.timeline_options enable row level security;
alter table public.comfort_options enable row level security;
alter table public.stories enable row level security;

grant select on public.templates to anon, authenticated;
grant select on public.template_milestones to anon, authenticated;
grant select on public.activity_prompts to anon, authenticated;
grant select on public.providers to anon, authenticated;
grant select on public.provider_testimonials to anon, authenticated;
grant select on public.provider_templates to anon, authenticated;
grant select on public.quiz_questions to anon, authenticated;
grant select on public.quiz_options to anon, authenticated;
grant select on public.timeline_options to anon, authenticated;
grant select on public.comfort_options to anon, authenticated;
grant select on public.stories to anon, authenticated;

create policy templates_public_read on public.templates
  for select to anon, authenticated using (true);
create policy template_milestones_public_read on public.template_milestones
  for select to anon, authenticated using (true);
create policy activity_prompts_public_read on public.activity_prompts
  for select to anon, authenticated using (true);
create policy providers_public_read on public.providers
  for select to anon, authenticated using (true);
create policy provider_testimonials_public_read on public.provider_testimonials
  for select to anon, authenticated using (true);
create policy provider_templates_public_read on public.provider_templates
  for select to anon, authenticated using (true);
create policy quiz_questions_public_read on public.quiz_questions
  for select to anon, authenticated using (true);
create policy quiz_options_public_read on public.quiz_options
  for select to anon, authenticated using (true);
create policy timeline_options_public_read on public.timeline_options
  for select to anon, authenticated using (true);
create policy comfort_options_public_read on public.comfort_options
  for select to anon, authenticated using (true);
create policy stories_public_read on public.stories
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- User data: grants. anon gets nothing. Everything is authenticated-only; the
-- service-role admin path gets full access on the user tables it maintains.
-- ---------------------------------------------------------------------------

-- profiles: revoke table-wide update first so display_name is provably the only
-- updatable column for authenticated.
grant select, insert on public.profiles to authenticated;
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

-- journeys: permanent once created (no update/delete for authenticated).
grant select, insert on public.journeys to authenticated;

grant select, insert, update, delete on public.milestones to authenticated;
grant select, insert, update, delete on public.journey_activities to authenticated;
grant select, insert, update, delete on public.celebration_plans to authenticated;
grant select, insert on public.provider_interest to authenticated;

grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.journeys to service_role;
grant select, insert, update, delete on public.milestones to service_role;
grant select, insert, update, delete on public.journey_activities to service_role;
grant select, insert, update, delete on public.celebration_plans to service_role;
grant select, insert, update, delete on public.provider_interest to service_role;

-- ---------------------------------------------------------------------------
-- User data: RLS.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.journeys enable row level security;
alter table public.milestones enable row level security;
alter table public.journey_activities enable row level security;
alter table public.celebration_plans enable row level security;
alter table public.provider_interest enable row level security;

create policy profiles_select_own_or_children on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or parent_id = (select auth.uid()));

-- Self-registration is parent-only; child profiles come from the server-only
-- admin path which bypasses RLS deliberately.
create policy profiles_insert_self_parent on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and role = 'parent' and parent_id is null);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy journeys_select_own_or_parent on public.journeys
  for select to authenticated
  using (child_id = (select auth.uid()) or public.is_parent_of(child_id));

create policy journeys_insert_own on public.journeys
  for insert to authenticated
  with check (child_id = (select auth.uid()));

create policy milestones_select on public.milestones
  for select to authenticated
  using (public.can_view_journey(journey_id));

create policy milestones_write on public.milestones
  for insert to authenticated
  with check (public.owns_journey(journey_id));

create policy milestones_update on public.milestones
  for update to authenticated
  using (public.owns_journey(journey_id))
  with check (public.owns_journey(journey_id));

create policy milestones_delete on public.milestones
  for delete to authenticated
  using (public.owns_journey(journey_id));

create policy activities_select on public.journey_activities
  for select to authenticated
  using (public.can_view_journey(journey_id));

create policy activities_write on public.journey_activities
  for insert to authenticated
  with check (public.owns_journey(journey_id));

create policy activities_update on public.journey_activities
  for update to authenticated
  using (public.owns_journey(journey_id))
  with check (public.owns_journey(journey_id));

create policy activities_delete on public.journey_activities
  for delete to authenticated
  using (public.owns_journey(journey_id));

create policy celebration_select on public.celebration_plans
  for select to authenticated
  using (public.can_view_journey(journey_id));

create policy celebration_write on public.celebration_plans
  for insert to authenticated
  with check (public.owns_journey(journey_id));

create policy celebration_update on public.celebration_plans
  for update to authenticated
  using (public.owns_journey(journey_id))
  with check (public.owns_journey(journey_id));

create policy interest_insert_own on public.provider_interest
  for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy interest_select_own on public.provider_interest
  for select to authenticated
  using (created_by = (select auth.uid()));
