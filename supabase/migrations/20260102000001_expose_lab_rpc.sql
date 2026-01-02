-- EXPOSE LAB KANBAN VIA RPC (Avoids Dashboard configuration)

-- Wrapper function to access schema_lab.get_kanban_board
CREATE OR REPLACE FUNCTION public.get_lab_kanban()
RETURNS TABLE (
    id UUID,
    patient_name TEXT,
    status TEXT,
    priority TEXT,
    due_date DATE,
    items_count BIGINT
) 
LANGUAGE sql 
SECURITY DEFINER -- Runs with privileges of creator
SET search_path = schema_lab, public
AS $$
    SELECT * FROM schema_lab.get_kanban_board();
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_lab_kanban() TO authenticated;
