-- 🏗️ LAB ROLES & NOTIFICATIONS UPDATE
-- Description: Adds 'lab_coordinator' role and notification system for client approvals.

-- 1. Add 'lab_coordinator' to allowed roles
ALTER TABLE schema_core.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE schema_core.users ADD CONSTRAINT users_role_check CHECK (
    role IN ('super_admin', 'clinic_admin', 'doctor', 'lab_admin', 'lab_coordinator', 'lab_staff', 'courier', 'patient')
);

-- 2. Create Notifications Table (Unified for Dashboard/Mobile)
CREATE TABLE IF NOT EXISTS schema_core.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES schema_core.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'approval')),
    target_route TEXT, -- Link to the order or page
    is_read BOOLEAN DEFAULT FALSE,
    payload JSONB DEFAULT '{}'::JSONB, -- Extra data for mobile/analytics
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trigger for Client Approval (Notification to Doctor)
CREATE OR REPLACE FUNCTION schema_lab.notify_doctor_on_approval_needed()
RETURNS TRIGGER AS $$
DECLARE
    v_doctor_id UUID;
BEGIN
    -- Only trigger when moving to client_approval
    IF (NEW.status = 'client_approval' AND (OLD.status IS NULL OR OLD.status <> 'client_approval')) THEN
        
        -- Find the doctor user ID based on clinical link (simplified for now to email or direct link if exists)
        -- In a real scenario, we link orders to a specific doctor_id uuid. 
        -- For now, we search by email if available, or just log the notification requirement.
        
        INSERT INTO schema_core.notifications (user_id, title, message, type, target_route)
        VALUES (
            NEW.doctor_id, -- Assumes doctor_id exists on orders table
            'Aprobación Requerida: Orden #' || SUBSTRING(NEW.id::text, 1, 8),
            'Tu orden de ' || NEW.patient_name || ' está lista para revisión de diseño.',
            'approval',
            '/dashboard/medical/orders/' || NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add doctor_id link to orders if missing
ALTER TABLE schema_lab.orders ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES schema_core.users(id);

-- 5. RLS for Notifications
ALTER TABLE schema_core.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON schema_core.notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "System/Admins insert notifications" ON schema_core.notifications
    FOR INSERT TO authenticated
    WITH CHECK (true); -- Usually restricted to server-side or triggers

GRANT SELECT, INSERT, UPDATE ON schema_core.notifications TO authenticated;
