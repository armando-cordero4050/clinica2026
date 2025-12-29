-- Create Appointments Table
DROP TABLE IF EXISTS public.appointments CASCADE;

create table public.appointments (
  id uuid not null default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id),
  patient_id uuid not null references public.patients(id),
  doctor_id uuid references public.profiles(id), -- Optional: could be assigned later? Usually mandatory.
  title text not null, -- Brief description ex: "Consulta General"
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint appointments_pkey primary key (id),
  constraint appointments_dates_check check (end_time > start_time)
);

-- RLS
alter table public.appointments enable row level security;

create policy "Users can view appointments for their clinic"
  on public.appointments for select
  using (
    auth.uid() in (
      select id from profiles where clinic_id = appointments.clinic_id
    )
  );

create policy "Users can insert appointments for their clinic"
  on public.appointments for insert
  with check (
    auth.uid() in (
      select id from profiles where clinic_id = appointments.clinic_id
    )
  );

create policy "Users can update appointments for their clinic"
  on public.appointments for update
  using (
    auth.uid() in (
      select id from profiles where clinic_id = appointments.clinic_id
    )
  );

create policy "Users can delete appointments for their clinic"
  on public.appointments for delete
  using (
    auth.uid() in (
      select id from profiles where clinic_id = appointments.clinic_id
    )
  );

-- Indexes
create index appointments_clinic_id_idx on public.appointments(clinic_id);
create index appointments_patient_id_idx on public.appointments(patient_id);
create index appointments_start_time_idx on public.appointments(start_time);
