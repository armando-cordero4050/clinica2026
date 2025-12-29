-- ============================================
-- MIGRATION 1: Foundation Tables & Basic RLS
-- ============================================
-- Execute as postgres role to bypass RLS during DDL operations
SET ROLE postgres;

-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 1. CLINICS TABLE (Tenant Root)
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  phone text,
  tax_percent numeric(5,2) default 12.00,
  currency_default text default 'GTQ',
  created_at timestamptz default now()
);

alter table public.clinics enable row level security;

-- 2. APP_ROLE ENUM (Idempotent)
do $$ begin
  create type public.app_role as enum ('super_admin', 'clinic_admin', 'dentist', 'receptionist', 'lab_staff');
exception
  when duplicate_object then null;
end $$;

-- 3. PROFILES TABLE (Extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id),
  full_name text,
  role public.app_role not null default 'dentist',
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- 4. RBAC TABLES (Roles, Permissions, Role_Permissions)
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text
);

create table if not exists public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- 5. HELPER FUNCTION: get_current_clinic_id()
create or replace function public.get_current_clinic_id()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  return (select clinic_id from public.profiles where id = auth.uid());
end;
$$;

-- 6. HELPER FUNCTION: has_permission() - Placeholder
create or replace function public.has_permission(_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Placeholder: will be replaced in migration 2
  return true; 
end;
$$;

-- 7. RLS POLICIES

-- Clinics: Users can view their own clinic
drop policy if exists "Users can view their own clinic" on public.clinics;
create policy "Users can view their own clinic"
  on public.clinics
  for select
  using (id = public.get_current_clinic_id());

-- Profiles: Users can view members of their clinic
drop policy if exists "Users can view members of their clinic" on public.profiles;
create policy "Users can view members of their clinic"
  on public.profiles
  for select
  using (clinic_id = public.get_current_clinic_id());

-- Profiles: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (id = auth.uid());

-- Roles/Permissions: Authenticated users can read
drop policy if exists "Auth users can read roles" on public.roles;
create policy "Auth users can read roles"
  on public.roles for select to authenticated using (true);
  
drop policy if exists "Auth users can read permissions" on public.permissions;
create policy "Auth users can read permissions"
  on public.permissions for select to authenticated using (true);

drop policy if exists "Auth users can read role_permissions" on public.role_permissions;
create policy "Auth users can read role_permissions"
  on public.role_permissions for select to authenticated using (true);
