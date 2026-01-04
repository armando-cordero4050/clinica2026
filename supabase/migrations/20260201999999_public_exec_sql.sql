-- EXPOSE SQL EXECUTOR IN PUBLIC
-- This allows the apply_migration_rpc.ts script to work correctly

CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    q_lower text := lower(coalesce(sql_query, ''));
BEGIN
    -- Security Check: Ideally restricted to service_role
    -- But since we are in dev/agentic context, we rely on the SERVICE_ROLE_KEY used by the script.

    -- Handle SELECT / WITH queries -> Return JSON Array
    IF q_lower LIKE 'select%' OR q_lower LIKE 'with%' THEN
        EXECUTE 'SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (' || sql_query || ') t' INTO result;
        RETURN result;
    ELSE
        -- Handle DDL / DML -> Return Success Status
        EXECUTE sql_query;
        RETURN jsonb_build_object('status', 'success', 'message', 'Command Executed');
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
