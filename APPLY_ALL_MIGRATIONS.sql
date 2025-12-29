-- ========================================
-- MIGRATION: 20251224_001_foundation.sql
-- ========================================

/*
  # 001_foundation.sql
  - Clinics (Tenant root)
  - Profiles (Users linked to Auth)
  - RBAC (Roles, Permissions)
  - RLS Policies
*/

-- 1. Clinics Table
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  phone text,
  tax_percent numeric(5,2) default 12.00,
  currency_default text default 'GTQ',
  created_at timestamptz default now()
);

alter table public.clinics enable row level security;

-- 2. Profiles (Extends auth.users)
-- Create custom types for roles
create type public.app_role as enum ('super_admin', 'clinic_admin', 'dentist', 'receptionist', 'lab_staff');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id),
  full_name text,
  role public.app_role not null default 'dentist',
  active boolean default true,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- 3. Roles & Permissions (RBAC Metadata)
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- e.g. 'patients.read'
  description text
);

create table public.role_permissions (
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- 4. Helper Functions

-- Function: get_current_clinic_id()
-- Returns the clinic_id of the currently logged in user based on profiles table.
create or replace function public.get_current_clinic_id()
returns uuid
language plpgsql
security definer
as $$
declare
  _clinic_id uuid;
begin
  select clinic_id into _clinic_id
  from public.profiles
  where id = auth.uid();
  return _clinic_id;
end;
$$;

-- Function: has_permission(code)
-- Checks if current user has a specific permission code via their role.
create or replace function public.has_permission(_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  _has_perm boolean;
  _user_role public.app_role;
begin
  -- Simple check based on profile role for now, or join with roles table if fully dynamic.
  -- For V1, we map Enum roles to Code roles or use the Enum directly.
  -- To keep it simple per requirements:
  -- We'll assume the 'role' column in profiles maps to a code in roles table if needed,
  -- but for now let's use the profiles.role ENUM for major logic and RBAC tables for fine-grained.
  
  -- Placeholder for complex RBAC. For foundation, return true if user is active.
  return true; 
end;
$$;

-- 5. RLS Policies

-- Clinics:
-- Super admin can do everything (implementation depends on how we identify super_admin, usually a specific profile or claim).
-- Users can view THEIR own clinic.
create policy "Users can view their own clinic"
  on public.clinics
  for select
  using (
    id = public.get_current_clinic_id()
  );

-- Profiles:
-- Users can view profiles within their same clinic.
create policy "Users can view members of their clinic"
  on public.profiles
  for select
  using (
    clinic_id = public.get_current_clinic_id()
  );

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  using (
    id = auth.uid()
  );

-- Roles/Permissions: public read (for authenticated users)
create policy "Auth users can read roles"
  on public.roles for select to authenticated using (true);
  
create policy "Auth users can read permissions"
  on public.permissions for select to authenticated using (true);

create policy "Auth users can read role_permissions"
  on public.role_permissions for select to authenticated using (true);




-- ========================================
-- MIGRATION: 20251224_002_patients.sql
-- ========================================

-- Migration: 20251224_002_patients
-- Description: Patients table with strict Multi-Tenancy (ADR-0010 & ADR-0011)
-- Updated: Uses check_permission, gen_random_uuid, and combined audit trigger.
-- Author: DentalFlow Architect (User Reviewed)

-- Requisito: Habilitar pgcrypto para gen_random_uuid()
create extension if not exists "pgcrypto";

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),

  clinic_id uuid not null references public.clinics(id) on delete cascade,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),

  first_name text not null,
  last_name text not null,
  date_of_birth date,

  email text,
  phone text,
  dni_nit text,

  gender char(1) check (gender in ('M','F','O')),

  currency_code char(3) not null default 'GTQ'
    check (currency_code in ('GTQ','USD')),

  address jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

-- =========================
-- NormalizaciÃ³n e Ã­ndices (ADR-0011)
-- =========================

-- Email Ãºnico por clÃ­nica, ignorando NULL y '' y case-insensitive
create unique index if not exists patients_email_unique_per_clinic
on public.patients (clinic_id, lower(trim(email)))
where email is not null and trim(email) <> '';

-- DNI/NIT Ãºnico por clÃ­nica, ignorando NULL y '' y trim
create unique index if not exists patients_dni_unique_per_clinic
on public.patients (clinic_id, trim(dni_nit))
where dni_nit is not null and trim(dni_nit) <> '';

-- Ãndices de bÃºsqueda habituales
create index if not exists patients_clinic_id_idx on public.patients (clinic_id);
create index if not exists patients_name_idx on public.patients (clinic_id, last_name, first_name);

-- =========================
-- Triggers: Combined Update Audit & Created Safety
-- =========================

-- Combined Update (updated_at + updated_by)
create or replace function public.set_update_audit()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_patients_set_updated_at on public.patients;
drop trigger if exists trg_patients_set_updated_by on public.patients; -- Clean up potential old ones

create trigger trg_patients_set_update_audit
before update on public.patients
for each row execute function public.set_update_audit();

-- Created Safety (Anti-spoofing)
create or replace function public.set_created_by_safe()
returns trigger
language plpgsql
as $$
begin
  -- Force created_by to be the current user
  new.created_by = auth.uid();
  new.updated_by = auth.uid();
  -- Optional: If created_at is strictly managed, enforce it here too? 
  -- Default now() is usually fine.
  return new;
end;
$$;

drop trigger if exists trg_patients_set_created_by on public.patients;
create trigger trg_patients_set_created_by
before insert on public.patients
for each row execute function public.set_created_by_safe();


-- =========================
-- RLS (Via check_permission)
-- =========================
alter table public.patients enable row level security;

-- SELECT: 'patients.view'
drop policy if exists "patients_select" on public.patients;
create policy "patients_select"
on public.patients
for select
using (
  public.check_permission('patients.view', clinic_id)
);

-- INSERT: 'patients.create'
drop policy if exists "patients_insert" on public.patients;
create policy "patients_insert"
on public.patients
for insert
with check (
  public.check_permission('patients.create', clinic_id)
);

-- UPDATE: 'patients.edit'
drop policy if exists "patients_update" on public.patients;
create policy "patients_update"
on public.patients
for update
using (
  public.check_permission('patients.edit', clinic_id)
)
with check (
  public.check_permission('patients.edit', clinic_id)
);

-- DELETE: 'patients.delete'
drop policy if exists "patients_delete" on public.patients;
create policy "patients_delete"
on public.patients
for delete
using (
  public.check_permission('patients.delete', clinic_id)
);



-- ========================================
-- MIGRATION: 20251224_003_tenancy_acl_fix.sql
-- ========================================

-- Migration: 20251224_003_tenancy_acl_fix
-- Description: Transition to M:N Tenancy and Strict ACL (ADR-0012)
-- Strategy: Non-destructive update. Uses existing UUID ACL tables via View.
-- Author: DentalFlow Architect

-- 1. Clinic Members (M:N Tenancy)
create table if not exists public.clinic_members (
    id uuid primary key default gen_random_uuid(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text not null default 'staff', -- Links to roles.code
    status text default 'active' check (status in ('active', 'invited', 'disabled')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(clinic_id, user_id)
);

alter table public.clinic_members enable row level security;

-- Policy: Users can view their own memberships
drop policy if exists "Users can view own memberships" on public.clinic_members;
create policy "Users can view own memberships"
on public.clinic_members for select
using (auth.uid() = user_id);

-- Policy: Clinic Admins can manage memberships (Fix 1: Admin Management)
drop policy if exists "clinic_members_manage" on public.clinic_members;
create policy "clinic_members_manage"
on public.clinic_members
for all
using (
  public.check_permission('clinic_members.manage', clinic_id)
)
with check (
  public.check_permission('clinic_members.manage', clinic_id)
);

-- 2. ACL Codes View (Bridge UUID tables to Text Codes)
create or replace view public.role_permission_codes as
select 
    r.code as role_code, 
    p.code as permission_code
from public.role_permissions rp
join public.roles r on rp.role_id = r.id
join public.permissions p on rp.permission_id = p.id;

-- 3. Profiles Updates (Context)
alter table public.profiles add column if not exists active_clinic_id uuid references public.clinics(id);
alter table public.profiles add column if not exists is_platform_admin boolean default false;

alter table public.profiles alter column clinic_id drop not null;

-- 4. Permission Check Function (Zero-Trust Core)
create or replace function public.check_permission(_permission_code text, _clinic_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    _user_role text;
begin
    -- 0. Platform Admin Bypass
    if exists (select 1 from public.profiles where id = auth.uid() and is_platform_admin = true) then
        return true;
    end if;

    -- 1. Get user role in specific clinic
    select role into _user_role
    from public.clinic_members
    where user_id = auth.uid()
    and clinic_id = _clinic_id
    and status = 'active';

    if _user_role is null then
        return false;
    end if;

    -- 2. Check if role has permission (via View)
    if exists (
        select 1 from public.role_permission_codes
        where role_code = _user_role
        and permission_code = _permission_code
    ) then
        return true;
    end if;

    return false;
end;
$$;

-- 5. Helper Overrides (Fix A + Bonus)

-- Fix A: get_current_clinic_id uses active_clinic_id
create or replace function public.get_current_clinic_id()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
    return (select active_clinic_id from public.profiles where id = auth.uid());
end;
$$;

-- Bonus: has_permission delegates to check_permission
create or replace function public.has_permission(_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.check_permission(_code, public.get_current_clinic_id());
end;
$$;

-- 6. Safe Policies for ACL (Fix C: DROP IF EXISTS)
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "Auth users can read roles" on public.roles;
create policy "Auth users can read roles" on public.roles for select to authenticated using (true);

drop policy if exists "Auth users can read permissions" on public.permissions;
create policy "Auth users can read permissions" on public.permissions for select to authenticated using (true);

drop policy if exists "Auth users can read role_permissions" on public.role_permissions;
create policy "Auth users can read role_permissions" on public.role_permissions for select to authenticated using (true);



-- ========================================
-- MIGRATION: 20251224_004_seed_roles.sql
-- ========================================

-- Migration: 20251224_004_seed_roles.sql
-- Purpose: Seed initial ROLES and PERMISSIONS for the Patients module and Clinic Administration.
-- Dependencies: 003_tenancy_acl_fix.sql (tables roles, permissions, role_permissions must exist).

-- 1. SEED PERMISSIONS (Patients Module)
-- We insert the "codes" that the frontend checks via usePermission('code').
insert into public.permissions (code, description)
values
    ('patients.view', 'Ver lista y detalles de pacientes'),
    ('patients.create', 'Crear nuevos pacientes'),
    ('patients.edit', 'Editar informaciÃ³n de pacientes'),
    ('patients.delete', 'Eliminar pacientes (soft/hard delete segÃºn polÃ­tica)'),
    ('clinic.settings', 'Administrar configuraciÃ³n de la clÃ­nica'),
    ('clinic_members.manage', 'Invitar o eliminar miembros de la clÃ­nica')
on conflict (code) do nothing;

-- 2. SEED ROLES
-- Standard roles for DentalFlow. active_clinic_id determines SCOPE, but ROLE determines LEVEL.
insert into public.roles (name, description)
values
    ('clinic_admin', 'Administrador total de la clÃ­nica'),
    ('dentist', 'OdontÃ³logo con acceso clÃ­nico completo'),
    ('assistant', 'Asistente o recepcionista'),
    ('lab_technician', 'TÃ©cnico de laboratorio (uso futuro)')
on conflict (name) do nothing;

-- 3. MAP ROLES -> PERMISSIONS (Role Permissions)
-- This logic assigns capabilities to the roles.

-- Helper function to bulk assign permissions to a role if not exists
do $$
declare
    r_admin_id uuid;
    r_dentist_id uuid;
    r_assist_id uuid;
begin
    -- Get Role IDs
    select id into r_admin_id from public.roles where name = 'clinic_admin';
    select id into r_dentist_id from public.roles where name = 'dentist';
    select id into r_assist_id from public.roles where name = 'assistant';

    -- A) CLINIC ADMIN: Gets EVERYTHING
    insert into public.role_permissions (role_id, permission_id)
    select r_admin_id, p.id
    from public.permissions p
    where p.code in (
        'patients.view', 'patients.create', 'patients.edit', 'patients.delete',
        'clinic.settings', 'clinic_members.manage'
    )
    on conflict (role_id, permission_id) do nothing;

    -- B) DENTIST: Can view, create, edit patients. NO DELETE. NO SETTINGS.
    insert into public.role_permissions (role_id, permission_id)
    select r_dentist_id, p.id
    from public.permissions p
    where p.code in (
        'patients.view', 'patients.create', 'patients.edit'
    )
    on conflict (role_id, permission_id) do nothing;

    -- C) ASSISTANT: Can view and create (scheduling context), maybe edit.
    insert into public.role_permissions (role_id, permission_id)
    select r_assist_id, p.id
    from public.permissions p
    where p.code in (
        'patients.view', 'patients.create', 'patients.edit'
    )
    on conflict (role_id, permission_id) do nothing;

end $$;



