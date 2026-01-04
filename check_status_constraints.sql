SELECT check_clause 
FROM information_schema.check_constraints c
JOIN information_schema.constraint_column_usage cu ON c.constraint_name = cu.constraint_name
WHERE cu.table_schema = 'schema_lab' AND cu.table_name = 'orders' AND cu.column_name = 'status'
