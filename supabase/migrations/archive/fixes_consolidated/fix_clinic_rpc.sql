CREATE OR REPLACE FUNCTION public.sync_clinic_from_odoo(
    p_odoo_id integer,
    p_name text,
    p_email text,
    p_phone text,
    p_address text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
BEGIN
    INSERT INTO schema_medical.clinics (
        odoo_partner_id,
        name,
        email,
        phone,
        address,
        is_active,
        created_at
    )
    VALUES (
        p_odoo_id,
        p_name,
        p_email,
        p_phone,
        p_address,
        true,
        NOW()
    )
    ON CONFLICT (odoo_partner_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        address = EXCLUDED.address,
        last_synced_from_odoo = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;
