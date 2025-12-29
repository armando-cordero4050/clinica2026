-- ============================================
-- MIGRATION 3: Patients Table & RLS
-- ============================================
-- Execute as postgres role to bypass RLS during DDL operations
SET ROLE postgres;

-- 1. PATIENTS TABLE
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

-- 2. INDEXES

-- Email unique per clinic (case-insensitive, ignore nulls)
create unique index if not exists patients_email_unique_per_clinic
on public.patients (clinic_id, lower(trim(email)))
where email is not null and trim(email) <> '';

-- DNI/NIT unique per clinic (ignore nulls)
create unique index if not exists patients_dni_unique_per_clinic
on public.patients (clinic_id, trim(dni_nit))
where dni_nit is not null and trim(dni_nit) <> '';

-- Search indexes
create index if not exists patients_clinic_id_idx on public.patients (clinic_id);
create index if not exists patients_name_idx on public.patients (clinic_id, last_name, first_name);

-- 3. TRIGGERS

-- Combined Update Audit (updated_at + updated_by)
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
drop trigger if exists trg_patients_set_updated_by on public.patients;

create trigger trg_patients_set_update_audit
before update on public.patients
for each row execute function public.set_update_audit();

-- Created Safety (Anti-spoofing)
create or replace function public.set_created_by_safe()
returns trigger
language plpgsql
as $$
begin
  new.created_by = auth.uid();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_patients_set_created_by on public.patients;
create trigger trg_patients_set_created_by
before insert on public.patients
for each row execute function public.set_created_by_safe();

-- 4. RLS POLICIES

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
