-- 🔧 EXPOSE SLA CONFIG VIA RPC
-- Description: Allow frontend to read and update SLA configuration

-- RPC to get all SLA configs
CREATE OR REPLACE FUNCTION public.get_sla_configs()
RETURNS TABLE (
    stage TEXT,
    target_hours INTEGER,
    warning_hours INTEGER,
    is_active BOOLEAN,
    updated_at TIMESTAMPTZ
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = schema_lab, public
AS $$
    SELECT stage, target_hours, warning_hours, is_active, updated_at
    FROM schema_lab.sla_config
    ORDER BY 
        CASE stage
            WHEN 'clinic_pending' THEN 1
            WHEN 'digital_picking' THEN 2
            WHEN 'income_validation' THEN 3
            WHEN 'gypsum' THEN 4
            WHEN 'design' THEN 5
            WHEN 'client_approval' THEN 6
            WHEN 'nesting' THEN 7
            WHEN 'production_man' THEN 8
            WHEN 'qa' THEN 9
            WHEN 'billing' THEN 10
            WHEN 'delivery' THEN 11
            ELSE 99
        END;
$$;

-- RPC to update SLA config
CREATE OR REPLACE FUNCTION public.update_sla_config(
    p_stage TEXT,
    p_target_hours INTEGER,
    p_warning_hours INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_core, public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Check if user is lab admin or super admin
    SELECT role INTO v_role FROM schema_core.users WHERE id = auth.uid();
    
    IF v_role NOT IN ('super_admin', 'lab_admin', 'lab_coordinator') THEN
        RAISE EXCEPTION 'No tienes permisos para modificar la configuración de SLA';
    END IF;

    UPDATE schema_lab.sla_config
    SET 
        target_hours = p_target_hours,
        warning_hours = p_warning_hours,
        updated_at = NOW()
    WHERE stage = p_stage;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sla_configs TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_sla_config TO authenticated;
