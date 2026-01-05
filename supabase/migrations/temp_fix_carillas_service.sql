-- Fix manual service by linking it to Odoo and updating price
-- This updates the existing LD-CARILLAS service with Odoo data

-- First, let's check what we have in odoo_products
SELECT odoo_product_id, name, list_price 
FROM schema_core.odoo_products 
WHERE name ILIKE '%CARILLAS%';

-- Update the service to link with Odoo and set the price
-- Replace the odoo_product_id with the actual ID from the query above
UPDATE schema_lab.services
SET 
    odoo_id = (SELECT odoo_product_id FROM schema_core.odoo_products WHERE name ILIKE '%CARILLAS%' LIMIT 1),
    sale_price_gtq = (SELECT list_price FROM schema_core.odoo_products WHERE name ILIKE '%CARILLAS%' LIMIT 1),
    last_synced = NOW()
WHERE name = 'LD-CARILLAS';

-- Verify the update
SELECT name, odoo_id, sale_price_gtq, cost_price_gtq, last_synced
FROM schema_lab.services
WHERE name = 'LD-CARILLAS';
