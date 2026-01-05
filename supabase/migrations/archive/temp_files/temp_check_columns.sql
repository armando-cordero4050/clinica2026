-- Check if sale_price_gtq column exists in schema_lab.services
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'schema_lab' 
  AND table_name = 'services'
  AND column_name IN ('base_price', 'sale_price_gtq', 'sale_price_usd', 'cost_price_gtq')
ORDER BY column_name;
