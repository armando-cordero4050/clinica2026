-- =====================================================
-- SINCRONIZACIÓN DE SERVICIOS - AUDITORÍA
-- Date: 2026-01-01
-- Description: Tabla para registrar sincronizaciones de servicios
--              desde Odoo por clínica
-- =====================================================

-- Drop existing objects if they exist (idempotent)
DROP TABLE IF EXISTS schema_core.service_sync_log;

-- Tabla de log de sincronizaciones
CREATE TABLE schema_core.service_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES schema_medical.clinics(id) ON DELETE CASCADE,
  
  -- Información de la sincronización
  sync_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_completed_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'success', 'failed'
  
  -- Estadísticas
  services_fetched INTEGER DEFAULT 0,
  services_updated INTEGER DEFAULT 0,
  services_created INTEGER DEFAULT 0,
  
  -- Errores
  error_message TEXT,
  error_details JSONB,
  
  -- Metadata
  triggered_by TEXT, -- 'auto', 'manual', 'user_id'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_service_sync_log_clinic ON schema_core.service_sync_log(clinic_id);
CREATE INDEX idx_service_sync_log_status ON schema_core.service_sync_log(sync_status);
CREATE INDEX idx_service_sync_log_completed ON schema_core.service_sync_log(sync_completed_at DESC);

-- Vista para última sincronización por clínica
CREATE OR REPLACE VIEW schema_core.clinic_last_sync AS
SELECT DISTINCT ON (clinic_id)
  clinic_id,
  sync_started_at,
  sync_completed_at,
  sync_status,
  services_fetched,
  services_updated,
  services_created,
  error_message
FROM schema_core.service_sync_log
WHERE sync_status = 'success'
ORDER BY clinic_id, sync_completed_at DESC;

-- RLS Policies
ALTER TABLE schema_core.service_sync_log ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view their clinic's sync logs
CREATE POLICY "Staff can view clinic sync logs"
  ON schema_core.service_sync_log
  FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM schema_medical.clinic_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: System can insert sync logs
CREATE POLICY "System can create sync logs"
  ON schema_core.service_sync_log
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update sync logs
CREATE POLICY "System can update sync logs"
  ON schema_core.service_sync_log
  FOR UPDATE
  USING (true);

-- Comentarios
COMMENT ON TABLE schema_core.service_sync_log IS 'Log de sincronizaciones de servicios desde Odoo';
COMMENT ON COLUMN schema_core.service_sync_log.sync_status IS 'Estado: in_progress, success, failed';
COMMENT ON VIEW schema_core.clinic_last_sync IS 'Última sincronización exitosa por clínica';
