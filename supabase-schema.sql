-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  role text check (role in ('admin', 'family_member')) default 'family_member',
  invited_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Invitations table
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  invited_by uuid references public.profiles(id) not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamptz default now()
);

alter table public.invitations enable row level security;

create policy "Admin can manage invitations"
  on public.invitations for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- People table (family tree nodes)
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

create policy "Authenticated users can read people"
  on public.people for select
  using (auth.role() = 'authenticated');

create policy "Admin can modify people"
  on public.people for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Relationships table (family tree edges)
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete cascade,
  related_person_id uuid references public.people(id) on delete cascade,
  relationship_type text check (relationship_type in ('parent', 'child', 'spouse', 'sibling')),
  unique(person_id, related_person_id, relationship_type)
);

alter table public.relationships enable row level security;

create policy "Authenticated users can read relationships"
  on public.relationships for select
  using (auth.role() = 'authenticated');

create policy "Admin can modify relationships"
  on public.relationships for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when exists (select 1 from public.invitations where email = new.email and status = 'pending')
      then 'family_member'
      else 'family_member'
    end
  );
  -- Mark invitation as accepted
  update public.invitations set status = 'accepted' where email = new.email;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
