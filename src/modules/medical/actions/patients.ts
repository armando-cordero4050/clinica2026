'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PatientInsert {
    id_type?: 'dpi' | 'passport' | 'nit' | 'other'
    id_number?: string
    first_name: string
    last_name: string
    gender?: 'male' | 'female' | 'other'
    email?: string
    phone?: string
    mobile?: string
    date_of_birth?: string // ISO date
    address?: string
    city?: string
    occupation?: string
    civil_status?: string
    clinic_id?: string
    acquisition_source?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    zip_code?: string
    state?: string
}

export interface Patient {
    id: string
    clinic_id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
    patient_code?: string
    created_at: string
    // add other fields as needed for display
}

export async function createPatient(data: PatientInsert) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, message: 'Usuario no autenticado' }
    }

    let clinicId = data.clinic_id
    if (!clinicId) {
        const { data: memberData } = await supabase
            .from('clinic_staff')
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
        // Generate full_name from first_name and last_name
        full_name: `${data.first_name} ${data.last_name}`.trim(),
        // Sanitize date_of_birth: convert empty string to null/undefined
        date_of_birth: data.date_of_birth === '' ? null : data.date_of_birth,
        clinic_id: clinicId,
        created_by: user.id,
        is_active: true,
        acquisition_source: data.acquisition_source || 'walk_in'
    }

    console.log("Creating patient with payload:", JSON.stringify(payload, null, 2))

    const { data: newPatient, error } = await supabase
        .from('patients')
        .insert(payload)
        .select()
        .single()
    
    if (error) {
        console.error("Error creating patient DB:", error)
        return { success: false, message: error.message }
    }

    revalidatePath('/dashboard/medical/patients')
    return { success: true, data: newPatient }
}

export async function getPatients(clinicId: string) {
    const supabase = await createClient()
    
    // RLS will handle schema access
    const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching patients:", error)
        return { success: false, message: error.message }
    }

    return { success: true, data: data as Patient[] }
}

export async function getPatientStats(clinicId: string) {
    const supabase = await createClient()
    
    // 1. Total Patients
    const { count: total, error: totalError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('is_active', true)

    if (totalError) {
        return { success: false, message: totalError.message }
    }

    // 2. New This Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count: newMonth, error: newError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .gte('created_at', startOfMonth)

     if (newError) {
        return { success: false, message: newError.message }
    }

    return { 
        success: true, 
        data: {
            totalPatients: total || 0,
            newThisMonth: newMonth || 0
        }
    }
}
