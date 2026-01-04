-- Sprint 1: Add delivery fields to orders table
-- Description: Adds fields for delivery type, digital files, and shipping info

-- 1. Add new columns
ALTER TABLE schema_lab.orders
ADD COLUMN IF NOT EXISTS delivery_type TEXT CHECK (delivery_type IN ('digital', 'pickup', 'shipping')) DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS digital_files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shipping_info JSONB,
ADD COLUMN IF NOT EXISTS lab_location JSONB;

-- 2. Add comments
COMMENT ON COLUMN schema_lab.orders.delivery_type IS 'Tipo de entrega: digital (archivos), pickup (recolección), shipping (envío por mensajería)';
COMMENT ON COLUMN schema_lab.orders.digital_files IS 'Array de archivos digitales [{name, url, size, type, uploaded_at}]';
COMMENT ON COLUMN schema_lab.orders.shipping_info IS 'Información de envío: {courier, tracking_number, estimated_arrival}';
COMMENT ON COLUMN schema_lab.orders.lab_location IS 'Ubicación del laboratorio {lat, lng, address}';

-- 3. Create index for delivery_type
CREATE INDEX IF NOT EXISTS idx_orders_delivery_type ON schema_lab.orders(delivery_type);

-- 4. Update existing orders to have default delivery_type
UPDATE schema_lab.orders 
SET delivery_type = 'pickup' 
WHERE delivery_type IS NULL;
