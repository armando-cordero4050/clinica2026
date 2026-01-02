-- Improved update_sla_config with better error handling
CREATE OR REPLACE FUNCTION public.update_sla_config(
    p_stage TEXT,
    p_target_hours INTEGER,
    p_warning_hours INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_lab, schema_core, public
AS $$
DECLARE
    v_role TEXT;
    v_user_id UUID;
    v_updated_count INTEGER;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Debug: Log user ID
    RAISE NOTICE 'User ID: %', v_user_id;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No se pudo identificar al usuario autenticado'
        );
    END IF;
    
    -- Check if user exists and get role
    SELECT role INTO v_role 
    FROM schema_core.users 
    WHERE id = v_user_id;
    
    -- Debug: Log role
    RAISE NOTICE 'User role: %', v_role;
    
    IF v_role IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuario no encontrado en schema_core.users',
            'user_id', v_user_id::text
        );
    END IF;
    
    -- Check permissions
    IF v_role NOT IN ('super_admin', 'lab_admin', 'lab_coordinator') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No tienes permisos para modificar la configuración de SLA',
            'current_role', v_role
        );
    END IF;

    -- Update SLA config
    UPDATE schema_lab.sla_config
    SET 
        target_hours = p_target_hours,
        warning_hours = p_warning_hours,
        updated_at = NOW()
    WHERE stage = p_stage;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    IF v_updated_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No se encontró la etapa especificada',
            'stage', p_stage
        );
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'SLA actualizado correctamente',
        'stage', p_stage,
        'target_hours', p_target_hours,
        'warning_hours', p_warning_hours
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_sla_config TO authenticated;

COMMENT ON FUNCTION public.update_sla_config IS 
  'Updates SLA configuration with improved error handling and returns detailed status';
