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

    // Use RPC for creation as it handles overlaps and clinic resolution internally
    // but we can still resolve clinic here for extra safety or if RPC fails
    const { data: newId, error } = await supabase.rpc('create_appointment_rpc', {
        p_patient_id: data.patient_id,
        p_doctor_id: data.doctor_id,
        p_title: data.title,
        p_start: data.start_time,
        p_end: data.end_time,
        p_appointment_type: data.type || 'consultation',
        p_reason: data.details?.reason || null
    })

    if (error) {
        console.error("Error creating appointment via RPC:", error)
        return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/medical/appointments')
    return { success: true, data: { id: newId } }
}

export async function getAppointments(startDate: Date | string, endDate: Date | string) {
    const supabase = await createClient()

    // Use RPC which bypasses RLS and handles schema
    const { data, error } = await supabase.rpc('get_appointments_rpc', {
        p_start: new Date(startDate).toISOString(),
        p_end: new Date(endDate).toISOString()
    })

    if (error) {
        console.error("Error fetching appointments:", JSON.stringify(error, null, 2))
        return { success: false, message: error.message }
    }

    return { success: true, data }
}
