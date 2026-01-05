-- Create table for clinic invoices (Odoo account.move)
CREATE TABLE IF NOT EXISTS schema_medical.clinic_invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    odoo_id integer UNIQUE,
    clinic_id uuid REFERENCES schema_medical.clinics(id),
    invoice_number text,
    date date,
    due_date date,
    total_amount numeric(15, 2),
    amount_residual numeric(15, 2),
    currency text,
    status text, -- 'draft', 'posted', 'cancel'
    payment_state text, -- 'not_paid', 'in_payment', 'paid', 'partial', 'reversed'
    odoo_partner_id integer,
    raw_data jsonb,
    last_synced_from_odoo timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_clinic_invoices_clinic ON schema_medical.clinic_invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_invoices_odoo ON schema_medical.clinic_invoices(odoo_id);

-- View in public schema
DROP VIEW IF EXISTS public.clinic_invoices;
CREATE VIEW public.clinic_invoices AS
SELECT i.*, c.name as clinic_name
FROM schema_medical.clinic_invoices i
LEFT JOIN schema_medical.clinics c ON i.clinic_id = c.id;

-- RPC for syncing
CREATE OR REPLACE FUNCTION public.sync_invoice_from_odoo(
    p_odoo_id integer,
    p_invoice_number text,
    p_date date,
    p_due_date date,
    p_total_amount numeric,
    p_amount_residual numeric,
    p_currency text,
    p_status text,
    p_payment_state text,
    p_odoo_partner_id integer,
    p_raw_data jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
    v_clinic_id uuid;
BEGIN
    -- Find clinic id by odoo partner id
    SELECT id INTO v_clinic_id FROM schema_medical.clinics WHERE odoo_partner_id = p_odoo_partner_id;

    INSERT INTO schema_medical.clinic_invoices (
        odoo_id,
        clinic_id,
        invoice_number,
        date,
        due_date,
        total_amount,
        amount_residual,
        currency,
        status,
        payment_state,
        odoo_partner_id,
        raw_data,
        last_synced_from_odoo
    )
    VALUES (
        p_odoo_id,
        v_clinic_id,
        p_invoice_number,
        p_date,
        p_due_date,
        p_total_amount,
        p_amount_residual,
        p_currency,
        p_status,
        p_payment_state,
        p_odoo_partner_id,
        p_raw_data,
        NOW()
    )
    ON CONFLICT (odoo_id) DO UPDATE SET
        invoice_number = EXCLUDED.invoice_number,
        date = EXCLUDED.date,
        due_date = EXCLUDED.due_date,
        total_amount = EXCLUDED.total_amount,
        amount_residual = EXCLUDED.amount_residual,
        currency = EXCLUDED.currency,
        status = EXCLUDED.status,
        payment_state = EXCLUDED.payment_state,
        raw_data = EXCLUDED.raw_data,
        last_synced_from_odoo = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;
