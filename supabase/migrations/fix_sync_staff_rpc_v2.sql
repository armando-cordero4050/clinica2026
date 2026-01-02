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
BEGIN
    -- 1. Find the clinic
    SELECT id INTO v_clinic_id FROM schema_medical.clinics WHERE odoo_partner_id = p_clinic_odoo_id;
    
    IF v_clinic_id IS NULL THEN
        -- Try to create/sync the clinic first if not found? 
        -- No, sync_customers should have done it. If not found, log skipping.
        RETURN NULL;
    END IF;

    -- 2. Handle User (public.users)
    -- Check if user exists by email
    SELECT id INTO v_user_id FROM public.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        -- Create new user
        INSERT INTO public.users (email, name, role, created_at)
        VALUES (p_email, p_name, 'clinic_staff', NOW())
        RETURNING id INTO v_user_id;
    ELSE
        -- Update user name
        UPDATE public.users SET name = p_name WHERE id = v_user_id;
    END IF;

    -- 3. Sync to clinic_staff
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
        'clinic_staff',
        p_job_position,
        p_phone,
        p_mobile,
        p_raw_data,
        NOW()
    )
    ON CONFLICT (odoo_contact_id) DO UPDATE SET
        clinic_id = EXCLUDED.clinic_id,
        user_id = EXCLUDED.user_id,
        job_position = EXCLUDED.job_position,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        odoo_raw_data = EXCLUDED.odoo_raw_data,
        updated_at = NOW()
    RETURNING id INTO v_staff_id;

    RETURN v_staff_id;
END;
$$;
