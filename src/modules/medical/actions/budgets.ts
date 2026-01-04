'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BudgetInsert {
    clinic_id?: string
    patient_id: string
    total: number
    status?: 'draft' | 'sent' | 'accepted' | 'rejected'
    items: any[] // JSONB items from odontogram
    expiration_date?: string
    notes?: string
}

export async function createBudget(data: BudgetInsert) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, message: 'Usuario no autenticado' }
    }

    let clinicId = data.clinic_id
    if (!clinicId) {
        // 1. Try to get from user's staff record
        const { data: memberData } = await supabase
            .from('clinic_staff')
            .select('clinic_id')
            .eq('user_id', user.id)
            .single()
        
        if (memberData) {
            clinicId = memberData.clinic_id
        }
    }

    // 2. Fallback: Get from patient record
    if (!clinicId && data.patient_id) {
        const { data: patientData } = await supabase
            .from('patients')
            .select('clinic_id')
            .eq('id', data.patient_id)
            .single()
        
        if (patientData) {
            clinicId = patientData.clinic_id
        }
    }

    if (!clinicId) {
         return { success: false, message: 'No se pudo determinar la clínica asociada (Usuario o Paciente)' }
    }

    const payload = {
        ...data,
        clinic_id: clinicId,
        created_by: user.id
    }

    // Try creating via public view first as it creates less friction
    const { data: result, error } = await supabase
        .from('budgets')
        .insert(payload)
        .select()
        .single()

    if (error) {
        console.error("Error creating budget:", error)
        return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/medical/patients/' + data.patient_id)
    return { success: true, data: result }
}
