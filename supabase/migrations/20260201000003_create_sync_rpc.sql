-- =====================================================
-- RPC FUNCTION FOR SERVICE SYNC
-- Date: 2026-01-01
-- Description: RPC function to handle service sync log creation
--              bypassing schema access issues
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.create_sync_log(UUID, TEXT);
DROP FUNCTION IF EXISTS public.update_sync_log(UUID, TEXT, INTEGER, INTEGER, INTEGER, TEXT, JSONB);

-- Function to create sync log entry
CREATE OR REPLACE FUNCTION public.create_sync_log(
  p_clinic_id UUID,
  p_triggered_by TEXT DEFAULT 'auto'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO schema_core.service_sync_log (
    clinic_id,
    sync_started_at,
    sync_status,
    triggered_by
  ) VALUES (
    p_clinic_id,
    NOW(),
    'in_progress',
    p_triggered_by
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to update sync log entry
CREATE OR REPLACE FUNCTION public.update_sync_log(
  p_log_id UUID,
  p_status TEXT,
  p_services_fetched INTEGER DEFAULT 0,
  p_services_updated INTEGER DEFAULT 0,
  p_services_created INTEGER DEFAULT 0,
  p_error_message TEXT DEFAULT NULL,
  p_error_details JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE schema_core.service_sync_log
  SET
    sync_completed_at = NOW(),
    sync_status = p_status,
    services_fetched = p_services_fetched,
    services_updated = p_services_updated,
    services_created = p_services_created,
    error_message = p_error_message,
    error_details = p_error_details
  WHERE id = p_log_id;
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_sync_log(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_sync_log(UUID, TEXT, INTEGER, INTEGER, INTEGER, TEXT, JSONB) TO authenticated;

-- Comments
COMMENT ON FUNCTION public.create_sync_log IS 'Creates a new sync log entry and returns its ID';
COMMENT ON FUNCTION public.update_sync_log IS 'Updates an existing sync log entry with results';
