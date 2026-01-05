-- Direct fix for LD-CARILLAS service
-- Links it with Odoo product and sets the correct sale price

UPDATE schema_lab.services
SET 
    odoo_id = 2,  -- ID from odoo_products
    sale_price_gtq = 600.00,  -- list_price from odoo_products
    last_synced = NOW()
WHERE name = 'LD-CARILLAS';

-- Verify the update
SELECT 
    name, 
    odoo_id, 
    sale_price_gtq, 
    cost_price_gtq, 
    base_price,
    last_synced
FROM schema_lab.services
WHERE name = 'LD-CARILLAS';
