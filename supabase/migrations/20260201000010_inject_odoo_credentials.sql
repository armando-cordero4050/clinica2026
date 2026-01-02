-- =====================================================
-- INJECT ODOO CREDENTIALS FROM ENV
-- Date: 2026-01-01
-- Description: Insert active Odoo configuration into schema_core.odoo_config
--              using values verified from .env
-- =====================================================

DO $$
BEGIN
    -- 1. Deactivate any existing config
    UPDATE schema_core.odoo_config SET is_active = false WHERE is_active = true;

    -- 2. Insert validated config
    INSERT INTO schema_core.odoo_config (
        url,
        database,
        username,
        api_key,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        'http://localhost:8069',
        'clinica-test',
        'jhernandez@smartnetgt.com',
        'Guate502#',
        true,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Odoo credentials injected correctly into schema_core.odoo_config';
END $$;
