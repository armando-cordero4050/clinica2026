-- Diagnostic query to check auth vs core user mismatch
-- This helps identify if the logged-in user has a different ID in auth.users vs schema_core.users

SELECT 
    'Auth Users' as source,
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'drpedro@clinica.com'

UNION ALL

SELECT 
    'Core Users' as source,
    id,
    email,
    created_at
FROM schema_core.users
WHERE email = 'drpedro@clinica.com'

ORDER BY source, created_at;
