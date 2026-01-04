CREATE OR REPLACE FUNCTION public.sync_staff_member_from_odoo(
    p_odoo_contact_id integer,
    p_clinic_odoo_id integer,
    p_name text,
    p_email text,
    p_job_position text,
    p_phone text,
    p_mobile text,
    p_raw_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_clinic_id uuid;
    v_staff_id uuid;
    v_target_role text;
BEGIN
    -- 1. Find the clinic
    SELECT id INTO v_clinic_id FROM schema_medical.clinics WHERE odoo_partner_id = p_clinic_odoo_id;
    
    IF v_clinic_id IS NULL THEN
        -- Log error or just return null?
        RETURN NULL;
    END IF;

    -- 2. Determine Role Mapping (Job Position -> System Role)
    v_target_role := 'clinic_staff'; -- Default fallback

    CASE p_job_position
        WHEN 'Administrador de Clínica' THEN v_target_role := 'clinic_admin';
        WHEN 'Gerente' THEN v_target_role := 'clinic_admin';
        WHEN 'Odontólogo' THEN v_target_role := 'doctor';
        WHEN 'Asistente Dental' THEN v_target_role := 'assistant';
        WHEN 'Recepcionista' THEN v_target_role := 'receptionist';
        WHEN 'Técnico Dental' THEN v_target_role := 'technician';
        WHEN 'Higienista' THEN v_target_role := 'hygienist';
        ELSE
            -- Si no coincide con ninguno, pero es el mismo contacto que la clínica (Owner) -> Admin
            IF p_odoo_contact_id = p_clinic_odoo_id THEN
                v_target_role := 'clinic_admin';
            END IF;
    END CASE;

    -- 3. Handle User (schema_core.users)
    SELECT id INTO v_user_id FROM schema_core.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        -- Create new user record
        INSERT INTO schema_core.users (email, name, role, is_pending_activation, created_at)
        VALUES (p_email, p_name, v_target_role, TRUE, NOW())
        RETURNING id INTO v_user_id;
    ELSE
        -- Update existing user data
        UPDATE schema_core.users SET name = p_name, role = v_target_role WHERE id = v_user_id;
    END IF;

    -- 4. Sync to clinic_staff
    INSERT INTO schema_medical.clinic_staff (
        clinic_id,
        user_id,
        odoo_contact_id,
        role,
        job_position,
        phone,
        mobile,
        odoo_raw_data,
        updated_at
    )
    VALUES (
        v_clinic_id,
        v_user_id,
        p_odoo_contact_id,
        v_target_role,
        p_job_position,
        p_phone,
        p_mobile,
        p_raw_data,
        NOW()
    )
    ON CONFLICT (odoo_contact_id) DO UPDATE SET
        clinic_id = EXCLUDED.clinic_id,
        user_id = EXCLUDED.user_id,
        role = EXCLUDED.role,
        job_position = EXCLUDED.job_position,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        odoo_raw_data = EXCLUDED.odoo_raw_data,
        updated_at = NOW()
    RETURNING id INTO v_staff_id;
    
    RETURN v_staff_id;
END;
$$;
