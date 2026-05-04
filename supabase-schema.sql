-- ============================================================================
-- Phase 3 schema: granular permissions, soft-disable, audit log.
-- Apply against a fresh Supabase project. For incremental migrations against
-- an existing database, use the Supabase MCP `apply_migration` tool with the
-- migrations under public.supabase_migrations.schema_migrations.
-- ============================================================================

-- ============================================================================
-- Roles
-- ============================================================================

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_system boolean not null default false,
  can_manage_users boolean not null default false,
  can_manage_roles boolean not null default false,
  can_invite boolean not null default false,
  can_edit_people boolean not null default false,
  can_edit_relationships boolean not null default false,
  can_view_family_tree boolean not null default true,
  can_view_audit_log boolean not null default false,
  created_at timestamptz default now()
);

insert into public.roles (name, description, is_system, can_manage_users, can_manage_roles, can_invite, can_edit_people, can_edit_relationships, can_view_family_tree, can_view_audit_log)
values
  ('admin', 'Full administrative access', true, true, true, true, true, true, true, true),
  ('family_member', 'Can view family tree only', true, false, false, false, false, false, true, false)
on conflict (name) do nothing;

alter table public.roles enable row level security;

-- ============================================================================
-- Profiles (extends auth.users)
-- ============================================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  role_id uuid not null references public.roles(id),
  disabled boolean not null default false,
  invited_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create index if not exists profiles_role_id_idx on public.profiles (role_id);

alter table public.profiles enable row level security;

-- ============================================================================
-- Invitations
-- ============================================================================

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  invited_by uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamptz default now()
);

alter table public.invitations enable row level security;

-- ============================================================================
-- People (family tree nodes)
-- ============================================================================

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  birth_date date,
  death_date date,
  photo_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.people enable row level security;

-- ============================================================================
-- Relationships (family tree edges)
-- ============================================================================

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade,
  related_person_id uuid references public.people(id) on delete cascade,
  relationship_type text check (relationship_type in ('parent', 'child', 'spouse', 'sibling')),
  unique(person_id, related_person_id, relationship_type)
);

alter table public.relationships enable row level security;

-- ============================================================================
-- Audit log
-- ============================================================================

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_id_idx on public.audit_log (actor_id);

alter table public.audit_log enable row level security;

-- ============================================================================
-- Permission helpers
-- ============================================================================

-- Granular permission check. Disabled users always return false.
create or replace function public.has_permission(perm text) returns boolean as $$
  select coalesce((
    select case
      when p.disabled then false
      else case perm
        when 'manage_users'         then r.can_manage_users
        when 'manage_roles'         then r.can_manage_roles
        when 'invite'               then r.can_invite
        when 'edit_people'          then r.can_edit_people
        when 'edit_relationships'   then r.can_edit_relationships
        when 'view_family_tree'     then r.can_view_family_tree
        when 'view_audit_log'       then r.can_view_audit_log
        else false
      end
    end
    from public.profiles p join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
  ), false);
$$ language sql security definer stable set search_path = public, pg_catalog;

revoke execute on function public.has_permission(text) from anon, authenticated, public;

-- Back-compat wrapper: an admin has both manage_users and manage_roles.
create or replace function public.is_admin() returns boolean as $$
  select public.has_permission('manage_users') and public.has_permission('manage_roles');
$$ language sql security definer stable set search_path = public, pg_catalog;

revoke execute on function public.is_admin() from anon, authenticated, public;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Auto-create profile on signup. Defaults to family_member role.
create or replace function public.handle_new_user() returns trigger as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id from public.roles where name = 'family_member' limit 1;
  if default_role_id is null then
    raise exception 'family_member role missing — cannot create profile';
  end if;

  insert into public.profiles (id, email, display_name, role_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    default_role_id
  );
  update public.invitations set status = 'accepted' where email = new.email;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog, auth;

revoke execute on function public.handle_new_user() from anon, authenticated, public;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block any user from changing their own role_id or disabled flag through the
-- self-update path on profiles. An admin demoting themselves to a less-
-- privileged role would otherwise lock the org out, so reassignment must come
-- from a different admin.
create or replace function public.guard_profile_self_update() returns trigger as $$
begin
  if (select auth.uid()) = old.id then
    if new.role_id is distinct from old.role_id then
      raise exception 'cannot modify own role_id';
    end if;
    if new.disabled is distinct from old.disabled then
      raise exception 'cannot modify own disabled flag';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;

revoke execute on function public.guard_profile_self_update() from anon, authenticated, public;

create or replace trigger profiles_guard_self_update
  before update on public.profiles
  for each row execute function public.guard_profile_self_update();

-- Block delete and rename of system roles, and toggling is_system.
create or replace function public.prevent_system_role_mutation() returns trigger as $$
begin
  if tg_op = 'DELETE' and old.is_system then
    raise exception 'cannot delete system role %', old.name;
  end if;
  if tg_op = 'UPDATE' and old.is_system then
    if new.name is distinct from old.name then
      raise exception 'cannot rename system role %', old.name;
    end if;
    if new.is_system is distinct from old.is_system then
      raise exception 'cannot toggle is_system on role %', old.name;
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;

revoke execute on function public.prevent_system_role_mutation() from anon, authenticated, public;

create or replace trigger roles_system_guard
  before update or delete on public.roles
  for each row execute function public.prevent_system_role_mutation();

-- Stop an admin from removing can_manage_roles on the role they currently hold.
create or replace function public.prevent_self_lockout() returns trigger as $$
begin
  if not new.can_manage_roles and old.can_manage_roles then
    if exists (
      select 1 from public.profiles
      where role_id = new.id and id = auth.uid()
    ) then
      raise exception 'cannot remove can_manage_roles from your own role';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_catalog;

revoke execute on function public.prevent_self_lockout() from anon, authenticated, public;

create or replace trigger roles_lockout_guard
  before update on public.roles
  for each row execute function public.prevent_self_lockout();

-- ============================================================================
-- RLS policies (drop-then-create so this file is idempotent)
-- ============================================================================

-- profiles: combined self+admin select; combined self+admin update (column-level
-- guard enforced by trigger above).
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select
  using ((select auth.uid()) = id or public.has_permission('manage_users'));

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update
  using ((select auth.uid()) = id or public.has_permission('manage_users'))
  with check ((select auth.uid()) = id or public.has_permission('manage_users'));

-- invitations: split by action so SELECT isn't double-evaluated.
drop policy if exists "invitations_select_admin" on public.invitations;
create policy "invitations_select_admin" on public.invitations for select using (public.has_permission('invite'));
drop policy if exists "invitations_insert_admin" on public.invitations;
create policy "invitations_insert_admin" on public.invitations for insert with check (public.has_permission('invite'));
drop policy if exists "invitations_update_admin" on public.invitations;
create policy "invitations_update_admin" on public.invitations for update using (public.has_permission('invite')) with check (public.has_permission('invite'));
drop policy if exists "invitations_delete_admin" on public.invitations;
create policy "invitations_delete_admin" on public.invitations for delete using (public.has_permission('invite'));

-- people
drop policy if exists "people_select_authed" on public.people;
create policy "people_select_authed" on public.people for select using ((select auth.uid()) is not null);
drop policy if exists "people_insert_admin" on public.people;
create policy "people_insert_admin" on public.people for insert with check (public.has_permission('edit_people'));
drop policy if exists "people_update_admin" on public.people;
create policy "people_update_admin" on public.people for update using (public.has_permission('edit_people')) with check (public.has_permission('edit_people'));
drop policy if exists "people_delete_admin" on public.people;
create policy "people_delete_admin" on public.people for delete using (public.has_permission('edit_people'));

-- relationships
drop policy if exists "relationships_select_authed" on public.relationships;
create policy "relationships_select_authed" on public.relationships for select using ((select auth.uid()) is not null);
drop policy if exists "relationships_insert_admin" on public.relationships;
create policy "relationships_insert_admin" on public.relationships for insert with check (public.has_permission('edit_relationships'));
drop policy if exists "relationships_update_admin" on public.relationships;
create policy "relationships_update_admin" on public.relationships for update using (public.has_permission('edit_relationships')) with check (public.has_permission('edit_relationships'));
drop policy if exists "relationships_delete_admin" on public.relationships;
create policy "relationships_delete_admin" on public.relationships for delete using (public.has_permission('edit_relationships'));

-- roles
drop policy if exists "roles_select_authed" on public.roles;
create policy "roles_select_authed" on public.roles for select using ((select auth.uid()) is not null);
drop policy if exists "roles_insert_admin" on public.roles;
create policy "roles_insert_admin" on public.roles for insert with check (public.has_permission('manage_roles'));
drop policy if exists "roles_update_admin" on public.roles;
create policy "roles_update_admin" on public.roles for update using (public.has_permission('manage_roles')) with check (public.has_permission('manage_roles'));
drop policy if exists "roles_delete_admin" on public.roles;
create policy "roles_delete_admin" on public.roles for delete using (public.has_permission('manage_roles'));

-- audit_log: admin-only read; insert gated to actor self (server actions write)
drop policy if exists "audit_log_select_admin" on public.audit_log;
create policy "audit_log_select_admin" on public.audit_log for select using (public.has_permission('view_audit_log'));
drop policy if exists "audit_log_insert_self" on public.audit_log;
create policy "audit_log_insert_self" on public.audit_log for insert with check (actor_id = (select auth.uid()));
