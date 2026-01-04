'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Perform a full factory reset of the system business data.
 * This will truncate all tables in medical, lab, and core schemas,
 * keeping only the super_admin user and core configurations.
 */
export async function factoryResetData() {
  const supabase = await createClient()

  const resetSql = `
    DO $$ 
    BEGIN
        -- 1. ESQUEMA MEDICAL
        TRUNCATE TABLE schema_medical.payments CASCADE;
        TRUNCATE TABLE schema_medical.budget_items CASCADE;
        TRUNCATE TABLE schema_medical.budgets CASCADE;
        TRUNCATE TABLE schema_medical.clinical_history CASCADE;
        TRUNCATE TABLE schema_medical.appointments CASCADE;
        TRUNCATE TABLE schema_medical.appointment_services CASCADE;
        TRUNCATE TABLE schema_medical.clinic_service_prices CASCADE;
        TRUNCATE TABLE schema_medical.evolution_procedures CASCADE;
        TRUNCATE TABLE schema_medical.evolution_notes CASCADE;
        TRUNCATE TABLE schema_medical.evolutions CASCADE;
        TRUNCATE TABLE schema_medical.dental_chart CASCADE;
        TRUNCATE TABLE schema_medical.clinical_findings CASCADE;
        TRUNCATE TABLE schema_medical.odontograms CASCADE;
        TRUNCATE TABLE schema_medical.patients CASCADE;
        TRUNCATE TABLE schema_medical.clinic_staff CASCADE;
        TRUNCATE TABLE schema_medical.clinic_invoices CASCADE;
        TRUNCATE TABLE schema_medical.clinics CASCADE;

        -- 2. ESQUEMA LAB
        TRUNCATE TABLE schema_lab.order_items CASCADE;
        TRUNCATE TABLE schema_lab.orders CASCADE;
        TRUNCATE TABLE schema_lab.order_stage_times CASCADE;
        TRUNCATE TABLE schema_lab.order_pauses CASCADE;
        TRUNCATE TABLE schema_lab.courier_locations CASCADE;
        TRUNCATE TABLE schema_lab.courier_assignments CASCADE;
        TRUNCATE TABLE schema_lab.delivery_routes CASCADE;
        TRUNCATE TABLE schema_lab.route_checkpoints CASCADE;
        TRUNCATE TABLE schema_lab.services CASCADE;

        -- 3. ESQUEMA CORE
        TRUNCATE TABLE schema_core.notifications CASCADE;
        TRUNCATE TABLE schema_core.odoo_customers CASCADE;
        TRUNCATE TABLE schema_core.odoo_products CASCADE;
        -- PRESERVE: odoo_sync_log (for debugging and audit)
        -- PRESERVE: service_sync_log (for debugging and audit)
        
        -- Usuarios: Salvamos Super Admin
        DELETE FROM schema_core.users WHERE role != 'super_admin';

        -- FINAL: Asegurar acceso
        IF NOT EXISTS (SELECT 1 FROM schema_core.users WHERE role = 'super_admin') THEN
            INSERT INTO schema_core.users (id, email, role, name, is_active)
            SELECT id, email, 'super_admin', 'Super Admin', true
            FROM auth.users
            WHERE email = 'admin@dentalflow.com'
            LIMIT 1;
        END IF;

    END $$;
  `

  try {
    // Execute reset SQL directly
    const { error } = await supabase.rpc('factory_reset_all_data')
    
    if (error) {
      console.error('Factory reset failed:', error)
      return { success: false, message: error.message }
    }

    revalidatePath('/')
    return { success: true, message: 'El sistema ha sido reseteado a cero exitosamente.' }
  } catch (err: any) {
    console.error('Factory reset error:', err)
    return { success: false, message: err.message }
  }
}
