-- FIX: Allow Lab Admin to view Clinic Data (Staff, Patients, Orders)
-- RLS was blocking standard mutations/queries from the frontend

-- 1. CLINIC STAFF
DROP POLICY IF EXISTS "Lab Admin view all staff" ON schema_medical.clinic_staff;
CREATE POLICY "Lab Admin view all staff" ON schema_medical.clinic_staff
FOR SELECT TO authenticated
USING ( 
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);

-- 2. PATIENTS (Necesario para ver nombre de paciente en lista de ordenes)
DROP POLICY IF EXISTS "Lab Admin view all patients" ON schema_medical.patients;
CREATE POLICY "Lab Admin view all patients" ON schema_medical.patients
FOR SELECT TO authenticated
USING ( 
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);

-- 3. ORDERS (Direct view)
DROP POLICY IF EXISTS "Lab Admin view all orders" ON schema_lab.orders;
CREATE POLICY "Lab Admin view all orders" ON schema_lab.orders
FOR SELECT TO authenticated
USING ( 
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);

-- 4. CLINICS (To see clinic list)
DROP POLICY IF EXISTS "Lab Admin view all clinics" ON schema_medical.clinics;
CREATE POLICY "Lab Admin view all clinics" ON schema_medical.clinics
FOR SELECT TO authenticated
USING ( 
    auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE role IN ('lab_admin', 'lab_staff', 'super_admin')
    )
);
