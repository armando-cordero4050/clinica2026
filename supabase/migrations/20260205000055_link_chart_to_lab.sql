-- Migration: 20260205000055_link_chart_to_lab.sql
-- Description: Adds lab_order_id to dental_chart to link clinical findings with lab orders.

ALTER TABLE schema_medical.dental_chart
ADD COLUMN IF NOT EXISTS lab_order_id uuid REFERENCES schema_lab.lab_orders(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dental_chart_lab_order ON schema_medical.dental_chart(lab_order_id);

-- Policy to allow clinic staff to update this column (already covered by existing policies, but good to verify)
-- Existing policy: "Clinic Isolation Update" ON schema_medical.dental_chart FOR UPDATE USING (clinic_id IN (...))
-- This allows updates to rows belonging to the user's clinic, so no new policy needed if RLS is row-based.
