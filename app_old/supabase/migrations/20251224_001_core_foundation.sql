-- Migration: 20251224_001_core_foundation
-- Description: Core tables for Multi-Tenancy (Clinics, Profiles, RBAC)
-- Author: DentalFlow Architect

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Clinics (Tenants)
create table public.clinics (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    logo_url text,
    address text,
    phone text,
    tax_nit text,
    tax_regime text,
    tax_percent numeric default 0.12, -- ADR-0008
    default_currency char(3) default 'GTQ', -- ADR-0007
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. Profiles (Users linked to Auth)
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text,
    avatar_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. Clinic Members (Many-to-Many: User <-> Clinic)
create table public.clinic_members (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role_name text not null default 'staff', -- Simple role for now, expands with RBAC tables
    status text default 'active' check (status in ('active', 'invited', 'disabled')),
    created_at timestamptz default now(),
    unique(clinic_id, user_id)
);

-- 5. FUNCTION: get_current_clinic_id()
-- Returns the clinic_id from the request header 'x-clinic-id'
-- This is critical for RLS. Frontend must send this header.
create or replace function public.get_current_clinic_id()
returns uuid
language plpgsql
stable
as $$
declare
    _header_val text;
begin
    -- Supabase passes headers in current_setting('request.headers', true) as JSON
    -- But for simplicity in local/edge, we often use a distinct approach or App Context
    -- For RLS, we check if the user is a member of the requested clinic.
    
    _header_val := current_setting('request.headers', true)::json->>'x-clinic-id';
    
    if _header_val is null then
        return null; 
    end if;

    return _header_val::uuid;
end;
$$;

-- 6. RLS Policies

-- Enable RLS
alter table public.clinics enable row level security;
alter table public.profiles enable row level security;
alter table public.clinic_members enable row level security;

-- Policy: Profiles
-- Users can see their own profile
create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- Policy: Clinic Members
-- Users can see memberships for themselves
create policy "Users can view own memberships"
on public.clinic_members for select
using (auth.uid() = user_id);

-- Policy: Clinics
-- Users can see clinics they are members of
create policy "Users can view assigned clinics"
on public.clinics for select
using (
    exists (
        select 1 from public.clinic_members cm
        where cm.clinic_id = clinics.id
        and cm.user_id = auth.uid()
    )
);

-- 7. Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at_clinics
before update on public.clinics
for each row execute procedure public.handle_updated_at();

create trigger set_updated_at_profiles
before update on public.profiles
for each row execute procedure public.handle_updated_at();

-- Note: Roles/Permissions/RBAC full implementation in next step or refined here if needed
-- For PR #2, basic clinic membership is enough to test multi-tenancy foundation.
