-- ============================================
-- MIGRATION 4: Seed Roles & Permissions
-- ============================================
-- Execute as postgres role to bypass RLS during DDL operations
SET ROLE postgres;

-- 1. SEED PERMISSIONS (Patients Module + Clinic Admin)
insert into public.permissions (code, description)
values
    ('patients.view', 'Ver lista y detalles de pacientes'),
    ('patients.create', 'Crear nuevos pacientes'),
    ('patients.edit', 'Editar información de pacientes'),
    ('patients.delete', 'Eliminar pacientes'),
    ('clinic.settings', 'Administrar configuración de la clínica'),
    ('clinic_members.manage', 'Invitar o eliminar miembros de la clínica')
on conflict (code) do nothing;

-- 2. SEED ROLES
insert into public.roles (code, description)
values
    ('clinic_admin', 'Administrador total de la clínica'),
    ('dentist', 'Odontólogo con acceso clínico completo'),
    ('assistant', 'Asistente o recepcionista'),
    ('lab_technician', 'Técnico de laboratorio (uso futuro)')
on conflict (code) do nothing;

-- 3. MAP ROLES -> PERMISSIONS
do $$
declare
    r_admin_id uuid;
    r_dentist_id uuid;
    r_assist_id uuid;
begin
    -- Get Role IDs
    select id into r_admin_id from public.roles where code = 'clinic_admin';
    select id into r_dentist_id from public.roles where code = 'dentist';
    select id into r_assist_id from public.roles where code = 'assistant';

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

    -- C) ASSISTANT: Can view and create (scheduling context)
    insert into public.role_permissions (role_id, permission_id)
    select r_assist_id, p.id
    from public.permissions p
    where p.code in (
        'patients.view', 'patients.create', 'patients.edit'
    )
    on conflict (role_id, permission_id) do nothing;

end $$;
