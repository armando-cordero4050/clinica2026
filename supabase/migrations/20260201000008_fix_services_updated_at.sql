-- Add updated_at to schema_lab.services
ALTER TABLE schema_lab.services
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION schema_lab.update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_services_updated_at ON schema_lab.services;
CREATE TRIGGER tr_services_updated_at
  BEFORE UPDATE ON schema_lab.services
  FOR EACH ROW
  EXECUTE FUNCTION schema_lab.update_services_updated_at();
