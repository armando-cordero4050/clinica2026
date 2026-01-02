-- Drop and recreate get_clinic_details function with better error handling
DROP FUNCTION IF EXISTS public.get_clinic_details(UUID);

CREATE OR REPLACE FUNCTION public.get_clinic_details(p_clinic_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_medical, schema_core, public
AS $$
DECLARE
    v_result JSONB;
    v_clinic_exists BOOLEAN;
BEGIN
    -- Check if clinic exists
    SELECT EXISTS(SELECT 1 FROM schema_medical.clinics WHERE id = p_clinic_id) INTO v_clinic_exists;
    
    IF NOT v_clinic_exists THEN
        RAISE EXCEPTION 'Clinic not found: %', p_clinic_id;
    END IF;
    
    -- Build result
    SELECT jsonb_build_object(
        'clinic', row_to_json(c.*),
        'staff', COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', cs.id,
                    'user_id', cs.user_id,
                    'name', u.name,
                    'email', u.email,
                    'role', cs.role,
                    'is_primary', cs.is_primary,
                    'odoo_contact_id', cs.odoo_contact_id
                )
            )
            FROM schema_medical.clinic_staff cs
            JOIN schema_core.users u ON cs.user_id = u.id
            WHERE cs.clinic_id = p_clinic_id
        ), '[]'::jsonb)
    ) INTO v_result
    FROM schema_medical.clinics c
    WHERE c.id = p_clinic_id;
    
    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in get_clinic_details: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_clinic_details TO authenticated;
