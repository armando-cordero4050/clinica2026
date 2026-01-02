-- =====================================================
-- MÓDULO DE SERVICIOS - PRECIOS POR CLÍNICA
-- Date: 2026-01-01
-- Description: Tabla para que cada clínica defina sus precios de venta
--              sobre los servicios de laboratorio (costo viene de Odoo)
-- =====================================================

-- Drop existing objects if they exist (idempotent)
DROP TRIGGER IF EXISTS tr_clinic_service_prices_updated_at ON schema_medical.clinic_service_prices;
DROP FUNCTION IF EXISTS schema_medical.update_clinic_service_prices_updated_at();
DROP INDEX IF EXISTS idx_clinic_service_prices_clinic;
DROP INDEX IF EXISTS idx_clinic_service_prices_service;
DROP INDEX IF EXISTS idx_clinic_service_prices_active;
DROP TABLE IF EXISTS schema_medical.clinic_service_prices;

-- 1. Crear tabla de precios de servicios por clínica
CREATE TABLE schema_medical.clinic_service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
  service_id UUID NOT NULL, -- Referencia a schema_lab.services (Odoo)
  
  -- Precios de COSTO (desde Odoo, solo lectura)
  cost_price_gtq DECIMAL(10,2),
  cost_price_usd DECIMAL(10,2),
  
  -- Precios de VENTA (definidos por la clínica)
  sale_price_gtq DECIMAL(10,2),
  sale_price_usd DECIMAL(10,2),
  
  -- Margen calculado
  margin_gtq DECIMAL(10,2) GENERATED ALWAYS AS (sale_price_gtq - COALESCE(cost_price_gtq, 0)) STORED,
  margin_usd DECIMAL(10,2) GENERATED ALWAYS AS (sale_price_usd - COALESCE(cost_price_usd, 0)) STORED,
  margin_percentage DECIMAL(5,2),
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true, -- Si la clínica ofrece este servicio
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES schema_core.users(id),
  updated_by UUID REFERENCES schema_core.users(id),
  
  -- Constraint: Una clínica solo puede tener un precio por servicio
  UNIQUE(clinic_id, service_id)
);

-- 2. Índices
CREATE INDEX idx_clinic_service_prices_clinic ON schema_medical.clinic_service_prices(clinic_id);
CREATE INDEX idx_clinic_service_prices_service ON schema_medical.clinic_service_prices(service_id);
CREATE INDEX idx_clinic_service_prices_active ON schema_medical.clinic_service_prices(clinic_id, is_active, is_available);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION schema_medical.update_clinic_service_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_clinic_service_prices_updated_at
  BEFORE UPDATE ON schema_medical.clinic_service_prices
  FOR EACH ROW
  EXECUTE FUNCTION schema_medical.update_clinic_service_prices_updated_at();

-- 4. RLS Policies
ALTER TABLE schema_medical.clinic_service_prices ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view their clinic's service prices
CREATE POLICY "Staff can view clinic service prices"
  ON schema_medical.clinic_service_prices
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Staff can insert service prices for their clinic
CREATE POLICY "Staff can create clinic service prices"
  ON schema_medical.clinic_service_prices
  FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Staff can update their clinic's service prices
CREATE POLICY "Staff can update clinic service prices"
  ON schema_medical.clinic_service_prices
  FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Staff can delete their clinic's service prices
CREATE POLICY "Staff can delete clinic service prices"
  ON schema_medical.clinic_service_prices
  FOR DELETE
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- 5. Comentarios
COMMENT ON TABLE schema_medical.clinic_service_prices IS 'Precios de venta de servicios por clínica (costo viene de Odoo)';
COMMENT ON COLUMN schema_medical.clinic_service_prices.cost_price_gtq IS 'Precio de costo desde Odoo (lo que paga la clínica)';
COMMENT ON COLUMN schema_medical.clinic_service_prices.sale_price_gtq IS 'Precio de venta definido por la clínica (lo que cobra al paciente)';
COMMENT ON COLUMN schema_medical.clinic_service_prices.margin_gtq IS 'Margen de ganancia calculado automáticamente';
