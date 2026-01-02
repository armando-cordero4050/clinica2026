'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AppointmentInsert {
    clinic_id?: string // Optional if taken from session/context inside RPC/RLS, but good to have in type
    patient_id?: string
    doctor_id?: string
    title: string
    start_time: string // ISO string
    end_time: string   // ISO string
    status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
    type?: 'consultation' | 'treatment' | 'emergency' | 'block'
    details?: any
}

export async function createAppointment(data: AppointmentInsert) {
    const supabase = await createClient()

    // Get current user to determine clinic (optional logic if strict RLS is used with session)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, message: 'Usuario no autenticado' }
    }

    // Explicitly get clinic_id for the current user if not provided
    // This assumes specific RLS setups or context helpers usually.
    // Ideally, RLS handles `auth.uid()` -> clinic check, but for INSERT we often need to provide the clinic_id
    // linked to the user. Let's fetch it safely.
    let clinicId = data.clinic_id
    if (!clinicId) {
        const { data: memberData } = await supabase
            .from('clinic_members')
            .select('clinic_id')
            .eq('user_id', user.id)
            .single()
        
        if (memberData) {
            clinicId = memberData.clinic_id
        }
    }

    if (!clinicId) {
         return { success: false, message: 'No se pudo determinar la clínica del usuario' }
    }

    const payload = {
        ...data,
        clinic_id: clinicId,
        created_by: user.id
    }

    const { data: result, error } = await supabase
        .from('schema_medical.appointments') // Assuming simple text table access for now, or use public view
        .insert(payload)
        .select()
        .single()

    // Fallback: try public view if schema specific fails due to library config
    if (error && error.code === '42P01') { // undefined_table
         const { data: resultPublic, error: errorPublic } = await supabase
            .from('appointments') // public view
            .insert(payload)
            .select()
            .single()
        
         if (errorPublic) {
            console.error("Error creating appointment (public view):", errorPublic)
            return { success: false, message: errorPublic.message }
         }
         revalidatePath('/dashboard/medical/appointments')
         return { success: true, data: resultPublic }
    }

    if (error) {
        console.error("Error creating appointment:", error)
        return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/medical/appointments')
    return { success: true, data: result }
}
