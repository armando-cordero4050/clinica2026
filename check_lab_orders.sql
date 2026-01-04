SELECT 
    o.id,
    o.clinic_id,
    o.patient_name,
    o.status,
    c.name as clinic_name
FROM schema_lab.orders o
LEFT JOIN schema_core.clinics c ON o.clinic_id = c.id
ORDER BY o.created_at DESC
LIMIT 5
