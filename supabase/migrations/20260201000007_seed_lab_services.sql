-- =====================================================
-- SEED DATA: LAB SERVICES (MOCK ODOO DATA)
-- Date: 2026-01-01
-- Description: Inserta servicios de prueba para validar sync
-- =====================================================

INSERT INTO schema_lab.services (
    code, 
    name, 
    description,
    category, 
    base_price, -- Legacy field
    cost_price_gtq,
    cost_price_usd,
    image_url,
    turnaround_days,
    is_active
) VALUES 
(
    'SVC-001', 
    'Limpieza Dental Profunda', 
    'Profilaxis completa con ultrasonido',
    'fija', 
    250.00,
    150.00, 
    20.00,
    'https://placehold.co/400x300?text=Limpieza',
    1,
    true
),
(
    'SVC-002', 
    'Corona de Zirconio', 
    'Corona completa monolítica',
    'fija', 
    1200.00,
    800.00, 
    100.00,
    'https://placehold.co/400x300?text=Zirconio',
    5,
    true
),
(
    'SVC-003', 
    'Prótesis Total Superior', 
    'Acrílico de alto impacto',
    'removible', 
    1800.00,
    1000.00, 
    130.00,
    'https://placehold.co/400x300?text=Protesis',
    7,
    true
),
(
    'SVC-004', 
    'Blanqueamiento LED', 
    'Sesión de 45 minutos',
    'fija', 
    1500.00,
    500.00, 
    65.00,
    'https://placehold.co/400x300?text=Whitening',
    1,
    true
),
(
    'SVC-005', 
    'Implante Unitario (Cuerpo)', 
    'Titanio Grado 5',
    'implantes', 
    3500.00,
    2000.00, 
    250.00,
    'https://placehold.co/400x300?text=Implante',
    10,
    true
)
ON CONFLICT DO NOTHING;
