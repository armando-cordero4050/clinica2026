-- Migration: Add SLA Days to Lab Configurations
-- Date: 2026-02-05
-- Description: Adds 'sla_days' column to 'schema_lab.lab_configurations' with a default of 3 days.

ALTER TABLE schema_lab.lab_configurations 
ADD COLUMN IF NOT EXISTS sla_days INTEGER DEFAULT 3;

-- Refresh the public view to include the new column
DROP VIEW IF EXISTS public.lab_configurations;
CREATE OR REPLACE VIEW public.lab_configurations AS SELECT * FROM schema_lab.lab_configurations;

GRANT SELECT ON public.lab_configurations TO authenticated;
