-- ============================================
-- MIGRATION 2: Multi-Tenancy & ACL System
-- ============================================
-- Execute as postgres role to bypass RLS during DDL operations
SET ROLE postgres;

-- 1. UPDATE PROFILES TABLE (Add active_clinic_id and is_platform_admin)
alter table public.profiles add column if not exists active_clinic_id uuid references public.clinics(id);
alter table public.profiles add column if not exists is_platform_admin boolean default false;
alter table public.profiles alter column clinic_id drop not null;

-- 2. CLINIC_MEMBERS TABLE (M:N Tenancy)
create table if not exists public.clinic_members (
    id uuid primary key default gen_random_uuid(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text not null default 'staff',
    status text default 'active' check (status in ('active', 'invited', 'disabled')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(clinic_id, user_id)
);

alter table public.clinic_members enable row level security;

-- 3. ACL CODES VIEW (Bridge UUID tables to Text Codes)
create or replace view public.role_permission_codes as
select 
    r.code as role_code, 
    p.code as permission_code
from public.role_permissions rp
join public.roles r on rp.role_id = r.id
join public.permissions p on rp.permission_id = p.id;

-- 4. CORE FUNCTIONS (MUST BE CREATED BEFORE POLICIES)

-- Update get_current_clinic_id to use active_clinic_id
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

-- check_permission: Zero-Trust Permission Check
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

    -- 2. Check if role has permission
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

-- has_permission: Convenience wrapper
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

-- 5. RLS POLICIES FOR CLINIC_MEMBERS

-- Users can view their own memberships
drop policy if exists "Users can view own memberships" on public.clinic_members;
create policy "Users can view own memberships"
on public.clinic_members for select
using (auth.uid() = user_id);

-- Clinic Admins can manage memberships
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
