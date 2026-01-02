-- EXPOSE MODULE CONFIGURATION VIA RPC (Avoids Dashboard configuration)

-- 1. Function to list modules (Accesses schema_core.modules)
CREATE OR REPLACE FUNCTION public.get_all_modules()
RETURNS SETOF schema_core.modules
LANGUAGE sql
SECURITY DEFINER -- Runs with privileges of creator (postgres) to access schema_core
SET search_path = schema_core, public
AS $$
  SELECT * FROM schema_core.modules ORDER BY name;
$$;

-- 2. Function to toggle status
CREATE OR REPLACE FUNCTION public.update_module_status(p_module_id UUID, p_is_active BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = schema_core, public
AS $$
BEGIN
  UPDATE schema_core.modules
  SET is_active = p_is_active, updated_at = NOW()
  WHERE id = p_module_id;
  
  RETURN FOUND;
END;
$$;

-- 3. Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_modules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_module_status(UUID, BOOLEAN) TO authenticated;
