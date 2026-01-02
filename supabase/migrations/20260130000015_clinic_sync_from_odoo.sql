-- 🏥 CLINIC SYNC FROM ODOO MODULE
-- Description: Sync Odoo Partners as Clinics with their contacts as staff

-- 1. Extend clinics table to store Odoo reference
ALTER TABLE schema_medical.clinics 
ADD COLUMN IF NOT EXISTS odoo_partner_id INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS odoo_raw_data JSONB,
ADD COLUMN IF NOT EXISTS last_synced_from_odoo TIMESTAMPTZ;

-- 2. Create clinic_staff table to manage contacts/users per clinic
CREATE TABLE IF NOT EXISTS schema_medical.clinic_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES schema_core.users(id) ON DELETE CASCADE,
    odoo_contact_id INTEGER,
    role TEXT DEFAULT 'clinic_staff' CHECK (role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist')),
    is_primary BOOLEAN DEFAULT FALSE,
    odoo_raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, user_id)
);

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_clinic_staff_clinic ON schema_medical.clinic_staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_user ON schema_medical.clinic_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_clinics_odoo_partner ON schema_medical.clinics(odoo_partner_id);

-- 4. RPC to sync a single clinic from Odoo
CREATE OR REPLACE FUNCTION public.sync_clinic_from_odoo(
    p_odoo_partner_id INTEGER,
    p_partner_data JSONB,
    p_contacts JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_medical, schema_core, public
AS $$
DECLARE
    v_clinic_id UUID;
    v_clinic_email TEXT;
    v_contact JSONB;
    v_user_id UUID;
    v_existing_user UUID;
    v_is_first_contact BOOLEAN := TRUE;
BEGIN
    -- Extract email (from partner or first contact)
    v_clinic_email := p_partner_data->>'email';
    
    IF v_clinic_email IS NULL OR v_clinic_email = '' THEN
        -- Get email from first contact
        IF jsonb_array_length(p_contacts) > 0 THEN
            v_clinic_email := p_contacts->0->>'email';
        END IF;
    END IF;
    
    -- Email is mandatory
    IF v_clinic_email IS NULL OR v_clinic_email = '' THEN
        RAISE EXCEPTION 'No se encontró email para la clínica. Email es obligatorio.';
    END IF;
    
    -- Check if clinic already exists
    SELECT id INTO v_clinic_id 
    FROM schema_medical.clinics 
    WHERE odoo_partner_id = p_odoo_partner_id;
    
    IF v_clinic_id IS NULL THEN
        -- Create new clinic
        INSERT INTO schema_medical.clinics (
            name,
            address,
            city,
            country,
            phone,
            email,
            nit,
            website,
            odoo_partner_id,
            odoo_raw_data,
            last_synced_from_odoo
        ) VALUES (
            p_partner_data->>'name',
            p_partner_data->>'street',
            p_partner_data->>'city',
            p_partner_data->>'country_id',
            COALESCE(p_partner_data->>'phone', p_partner_data->>'mobile'),
            v_clinic_email,
            p_partner_data->>'vat',
            p_partner_data->>'website',
            p_odoo_partner_id,
            p_partner_data,
            NOW()
        ) RETURNING id INTO v_clinic_id;
    ELSE
        -- Update existing clinic
        UPDATE schema_medical.clinics SET
            name = p_partner_data->>'name',
            address = p_partner_data->>'street',
            city = p_partner_data->>'city',
            country = p_partner_data->>'country_id',
            phone = COALESCE(p_partner_data->>'phone', p_partner_data->>'mobile'),
            email = v_clinic_email,
            nit = p_partner_data->>'vat',
            website = p_partner_data->>'website',
            odoo_raw_data = p_partner_data,
            last_synced_from_odoo = NOW()
        WHERE id = v_clinic_id;
    END IF;
    
    -- Sync contacts as staff
    FOR v_contact IN SELECT * FROM jsonb_array_elements(p_contacts)
    LOOP
        -- Check if user already exists
        SELECT id INTO v_existing_user 
        FROM schema_core.users 
        WHERE email = v_contact->>'email';
        
        IF v_existing_user IS NULL THEN
            -- Generate a UUID for the new user
            v_user_id := gen_random_uuid();
            
            -- Create user in our users table (auth.users will be created on first login)
            INSERT INTO schema_core.users (
                id,
                email,
                role,
                name,
                is_pending_activation
            ) VALUES (
                v_user_id,
                v_contact->>'email',
                CASE WHEN v_is_first_contact THEN 'clinic_admin' ELSE 'clinic_staff' END,
                v_contact->>'name',
                TRUE
            );
            
            v_is_first_contact := FALSE;
        ELSE
            v_user_id := v_existing_user;
        END IF;
        
        -- Link user to clinic as staff
        INSERT INTO schema_medical.clinic_staff (
            clinic_id,
            user_id,
            odoo_contact_id,
            role,
            is_primary,
            title,
            job_position,
            phone,
            mobile,
            odoo_raw_data
        ) VALUES (
            v_clinic_id,
            v_user_id,
            (v_contact->>'id')::INTEGER,
            CASE WHEN v_is_first_contact THEN 'clinic_admin' ELSE 'clinic_staff' END,
            v_is_first_contact,
            v_contact->>'title',
            v_contact->>'function',
            v_contact->>'phone',
            v_contact->>'mobile',
            v_contact
        )
        ON CONFLICT (clinic_id, user_id) DO UPDATE SET
            odoo_contact_id = EXCLUDED.odoo_contact_id,
            title = EXCLUDED.title,
            job_position = EXCLUDED.job_position,
            phone = EXCLUDED.phone,
            mobile = EXCLUDED.mobile,
            odoo_raw_data = EXCLUDED.odoo_raw_data,
            updated_at = NOW();
    END LOOP;
    
    RETURN v_clinic_id;
END;
$$;

-- 5. RPC to get clinic details with staff
CREATE OR REPLACE FUNCTION public.get_clinic_details(p_clinic_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_medical, schema_core, public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'clinic', row_to_json(c.*),
        'staff', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', cs.id,
                    'user_id', cs.user_id,
                    'name', u.name,
                    'email', u.email,
                    'role', cs.role,
                    'is_primary', cs.is_primary,
                    'odoo_contact_id', cs.odoo_contact_id,
                    'odoo_data', cs.odoo_raw_data
                )
            )
            FROM schema_medical.clinic_staff cs
            JOIN schema_core.users u ON cs.user_id = u.id
            WHERE cs.clinic_id = p_clinic_id
        )
    ) INTO v_result
    FROM schema_medical.clinics c
    WHERE c.id = p_clinic_id;
    
    RETURN v_result;
END;
$$;

-- 6. RPC to update staff role
CREATE OR REPLACE FUNCTION public.update_clinic_staff_role(
    p_staff_id UUID,
    p_new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_medical, schema_core, public
AS $$
DECLARE
    v_user_role TEXT;
BEGIN
    -- Check permissions
    SELECT role INTO v_user_role FROM schema_core.users WHERE id = auth.uid();
    
    IF v_user_role NOT IN ('super_admin', 'lab_admin', 'clinic_admin') THEN
        RAISE EXCEPTION 'No tienes permisos para modificar roles de staff';
    END IF;
    
    -- Update role
    UPDATE schema_medical.clinic_staff
    SET role = p_new_role, updated_at = NOW()
    WHERE id = p_staff_id;
    
    -- Also update in users table
    UPDATE schema_core.users u
    SET role = p_new_role
    FROM schema_medical.clinic_staff cs
    WHERE cs.id = p_staff_id AND u.id = cs.user_id;
END;
$$;

-- 7. RPC to reset staff password
CREATE OR REPLACE FUNCTION public.reset_clinic_staff_password(
    p_user_id UUID,
    p_new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
BEGIN
    -- Check permissions
    SELECT role INTO v_user_role FROM schema_core.users WHERE id = auth.uid();
    
    IF v_user_role NOT IN ('super_admin', 'lab_admin', 'clinic_admin') THEN
        RAISE EXCEPTION 'No tienes permisos para cambiar contraseñas';
    END IF;
    
    -- Update password in auth.users
    UPDATE auth.users
    SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_clinic_from_odoo TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_clinic_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_clinic_staff_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_clinic_staff_password TO authenticated;
