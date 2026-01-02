
-- ==============================================================================
-- AGENTIC SQL EXECUTOR (RPC V2 - ROBUST)
-- ==============================================================================
-- Updated based on external feedback for better JSON handling and security checks.
-- Apply this in Supabase SQL Editor ONCE.

CREATE OR REPLACE FUNCTION schema_core.exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    role_claim text := current_setting('request.jwt.claim.role', true);
    q_lower text := lower(coalesce(sql_query, ''));
BEGIN
    -- Security Check: Only allow 'service_role'
    IF role_claim IS NULL OR role_claim != 'service_role' THEN
        RAISE EXCEPTION 'Access Denied: Service Role Only';
    END IF;

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

GRANT EXECUTE ON FUNCTION schema_core.exec_sql(text) TO service_role;
