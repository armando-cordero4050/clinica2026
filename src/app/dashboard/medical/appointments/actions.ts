'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Appointment {
  id: string
  patient_name: string
  title: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  doctor_name?: string
  patient_id: string
  doctor_id?: string
}

export interface Patient {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email?: string
  phone?: string
  mobile?: string
}

export interface Doctor {
  id: string
  email: string
  role: string
}

/**
 * Get appointments within a date range
 */
export async function getAppointments(start: Date, end: Date): Promise<Appointment[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_appointments_rpc', {
    p_start: start.toISOString(),
    p_end: end.toISOString()
  })

  if (error) {
    console.error('Error fetching appointments:', JSON.stringify(error, null, 2))
    return []
  }

  return data as Appointment[]
}

/**
 * Search patients by name, email, or phone
 */
export async function searchPatients(query: string): Promise<Patient[]> {
  const supabase = await createClient()
  
  console.log('[searchPatients] Searching for:', query)

  const { data, error } = await supabase.rpc('search_patients_rpc', {
    p_query: query
  })

  if (error) {
    console.error('[searchPatients] Error:', JSON.stringify(error, null, 2))
    return []
  }

  console.log('[searchPatients] Found patients:', data?.length || 0)

  return data as Patient[]
}

/**
 * Get all doctors (staff with doctor role) in the user's clinic
 */
export async function getDoctors(): Promise<Doctor[]> {
  const supabase = await createClient()
  
  console.log('[getDoctors] Fetching doctors')

  const { data, error } = await supabase.rpc('get_doctors_rpc')

  if (error) {
    console.error('[getDoctors] Error:', JSON.stringify(error, null, 2))
    return []
  }

  console.log('[getDoctors] Found doctors:', data?.length || 0)

  return data as Doctor[]
}

/**
 * Create a new appointment
 */
export async function createAppointment(data: {
  patient_id: string
  doctor_id?: string
  title: string
  start: Date
  end: Date
  appointment_type?: string
  reason?: string
}) {
  const supabase = await createClient()

  console.log('[createAppointment] Creating appointment:', {
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    title: data.title,
    start: data.start.toISOString(),
    end: data.end.toISOString(),
    appointment_type: data.appointment_type || 'consultation',
    reason: data.reason
  })

  const { data: newId, error } = await supabase.rpc('create_appointment_rpc', {
    p_patient_id: data.patient_id,
    p_doctor_id: data.doctor_id || null,
    p_title: data.title,
    p_start: data.start.toISOString(),
    p_end: data.end.toISOString(),
    p_appointment_type: data.appointment_type || 'consultation',
    p_reason: data.reason || null
  })

  if (error) {
    console.error('[createAppointment] Error:', JSON.stringify(error, null, 2))
    return { success: false, message: error.message }
  }

  console.log('[createAppointment] Success! New appointment ID:', newId)
  
  revalidatePath('/dashboard/medical/appointments')
  return { success: true, id: newId }
}
