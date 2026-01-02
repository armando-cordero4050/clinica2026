-- EJECUTAR ESTE SQL EN SUPABASE SQL EDITOR
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view staff of their clinic" ON schema_medical.clinic_staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON schema_medical.clinic_staff;

-- Crear 3 políticas nuevas

-- Política 1: Usuarios pueden ver su PROPIO registro (CRÍTICA)
CREATE POLICY "Users can view their own staff record"
    ON schema_medical.clinic_staff
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Política 2: Usuarios pueden ver a otros staff de su clínica
CREATE POLICY "Users can view staff of their clinic"
    ON schema_medical.clinic_staff
    FOR SELECT
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id 
            FROM schema_medical.clinic_staff 
            WHERE user_id = auth.uid()
        )
    );

-- Política 3: Admins pueden gestionar todo
CREATE POLICY "Admins can manage all staff"
    ON schema_medical.clinic_staff
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM schema_core.users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'lab_admin')
        )
    );
