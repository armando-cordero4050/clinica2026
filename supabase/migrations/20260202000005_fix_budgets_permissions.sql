-- FIX BUDGETS SEQUENCE PERMISSIONS
-- This resolves the "permission denied for sequence budgets_code_seq" error

DO $$
DECLARE
    seq_name TEXT;
BEGIN
    -- Find the sequence name for budgets.code
    -- In PostgreSQL, SERIAL columns create a sequence named 'table_column_seq'
    -- Since we use schema_medical.budgets.code SERIAL, it is usually 'budgets_code_seq'
    
    -- Grant USAGE on all sequences in schema_medical to ensure this doesn't happen again
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA schema_medical TO authenticated;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA schema_medical TO service_role;
    
    -- Also ensure public schema sequences (if any) are accessible
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
END $$;

COMMENT ON TABLE schema_medical.budgets IS 'Presupuestos clínicos con items en JSONB y código secuencial automático';
