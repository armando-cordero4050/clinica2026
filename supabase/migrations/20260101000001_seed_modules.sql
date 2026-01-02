-- 🦅 DENTALFLOW V5 (2026) - SEED DATA: MODULES
-- Author: Antigravity Agent
-- Description: Populates the Available Modules in schema_core

INSERT INTO schema_core.modules (code, name, is_active, version, config)
VALUES 
    ('lab_kanban', 'Laboratorio: Backbone de Producción', true, '1.0.0', '{"kanban_columns": ["new", "design", "milling", "ceramic", "qc", "ready"]}'::jsonb),
    ('medical_emr', 'Clinica: Expedientes y Odontogramas', true, '1.0.0', '{}'::jsonb),
    ('logistics_tracking', 'Logística: Rutas y Mensajeros', false, '1.0.0', '{"provider": "google_maps"}'::jsonb),
    ('odoo_sync', 'Integración ERP Odoo (v19/Local)', false, '1.0.0', '{"sync_interval_min": 15}'::jsonb),
    ('gamification', 'Sistema de Puntos y KPIs', false, '1.0.0', '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;
