SELECT s.name, csp.is_available 
FROM schema_medical.clinic_service_prices csp
JOIN schema_lab.services s ON csp.service_id = s.id
WHERE csp.clinic_id = '64b03e60-0e0b-4efc-a84a-fbf952284b48' AND csp.is_available = true
