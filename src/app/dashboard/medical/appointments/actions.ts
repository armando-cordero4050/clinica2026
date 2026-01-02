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

export interface Service {
  id: string
  name: string
  description?: string
  price?: number
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
 * Create a new patient inline (minimal fields for quick appointment creation)
 */
export async function createPatientInline(data: {
  first_name: string
  last_name: string
  mobile: string
}) {
  const supabase = await createClient()
  
  console.log('[createPatientInline] Creating patient:', data)

  // Get current user's clinic_id
  const { data: profile } = await supabase.rpc('get_my_profile')
  
  if (!profile?.clinic_id) {
    console.error('[createPatientInline] No clinic_id found for user')
    return { success: false, message: 'No se pudo identificar la clínica del usuario' }
  }

  // Create patient
  const { data: newPatient, error } = await supabase
    .from('patients')
    .insert({
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      mobile: data.mobile.trim(),
      clinic_id: profile.clinic_id,
      is_active: true
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createPatientInline] Error:', JSON.stringify(error, null, 2))
    return { success: false, message: error.message }
  }

  console.log('[createPatientInline] Success! New patient ID:', newPatient.id)
  
  revalidatePath('/dashboard/medical/patients')
  return { success: true, id: newPatient.id }
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
  service_id?: string
}) {
  const supabase = await createClient()

  console.log('[createAppointment] Creating appointment:', {
    patient_id: data.patient_id,
    doctor_id: data.doctor_id,
    title: data.title,
    start: data.start.toISOString(),
    end: data.end.toISOString(),
    appointment_type: data.appointment_type || 'consultation',
    reason: data.reason,
    service_id: data.service_id
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newId, error } = await supabase.rpc('create_appointment_rpc', {
    p_patient_id: data.patient_id,
    p_doctor_id: data.doctor_id || null,
    p_title: data.title,
    p_start: data.start.toISOString(),
    p_end: data.end.toISOString(),
    p_appointment_type: data.appointment_type || 'consultation',
    p_reason: data.reason || null,
    p_service_id: data.service_id || null
  } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

  if (error) {
    console.error('[createAppointment] Error:', JSON.stringify(error, null, 2))
    return { success: false, message: error.message }
  }

  console.log('[createAppointment] Success! New appointment ID:', newId)
  
  revalidatePath('/dashboard/medical/appointments')
  return { success: true, id: newId }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()

  // Verify ownership via RLS policy implicitly, but good to have explicit RPC or update
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('[updateAppointmentStatus] Error:', error)
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard/medical/appointments')
  return { success: true }
}

/**
 * Get current logged-in doctor
 */
export async function getCurrentDoctor(): Promise<Doctor | null> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase.rpc('get_my_profile')
  
  if (!profile || !['clinic_doctor', 'doctor'].includes(profile.role)) {
    return null
  }

  return {
    id: profile.id,
    email: profile.email || '',
    role: profile.role
  }
}

/**
 * Search guardians (existing patients who can be guardians)
 */
export async function searchGuardians(query: string): Promise<Patient[]> {
  return searchPatients(query) // Reuse patient search
}

/**
 * Search services
 */
export async function searchServices(query: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clinic_service_prices')
    .select(`
      id,
      service_id,
      price,
      lab_services:service_id (
        id,
        name,
        description
      )
    `)
    .ilike('lab_services.name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('[searchServices] Error:', error)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.map((item: any) => ({
    id: item.service_id,
    name: item.lab_services?.name || '',
    description: item.lab_services?.description || '',
    price: item.price
  })) || []
}

/**
 * Create a new service
 */
export async function createService(data: {
  name: string
  description?: string
  price?: number
}) {
  const supabase = await createClient()
  
  // Get current user's clinic_id
  const { data: profile } = await supabase.rpc('get_my_profile')
  
  if (!profile?.clinic_id) {
    return { success: false, message: 'No se pudo identificar la clínica' }
  }

  // Create service in lab_services first
  const { data: newService, error: serviceError } = await supabase
    .from('lab_services')
    .insert({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      is_active: true
    })
    .select('id')
    .single()

  if (serviceError) {
    console.error('[createService] Error creating service:', serviceError)
    return { success: false, message: serviceError.message }
  }

  // Create price for this clinic
  if (data.price) {
    const { error: priceError } = await supabase
      .from('clinic_service_prices')
      .insert({
        clinic_id: profile.clinic_id,
        service_id: newService.id,
        price: data.price
      })

    if (priceError) {
      console.error('[createService] Error creating price:', priceError)
    }
  }

  revalidatePath('/dashboard/medical/services')
  return { success: true, id: newService.id, name: data.name }
}

/**
 * Create patient with optional guardian
 */
export async function createPatientWithGuardian(data: {
  // Patient data
  document_type: string
  document_number?: string
  first_name: string
  last_name: string
  mobile: string
  email?: string
  
  // Guardian data (optional)
  has_guardian?: boolean
  guardian_id?: string // If existing guardian
  guardian_relation?: string
  guardian_document_type?: string
  guardian_document_number?: string
  guardian_first_name?: string
  guardian_last_name?: string
  guardian_mobile?: string
  guardian_email?: string
  guardian_address?: string
}) {
  const supabase = await createClient()
  
  // Get current user's clinic_id
  const { data: profile } = await supabase.rpc('get_my_profile')
  
  if (!profile?.clinic_id) {
    return { success: false, message: 'No se pudo identificar la clínica del usuario' }
  }

  let guardianId = data.guardian_id

  // Create guardian if needed (new guardian)
  if (data.has_guardian && !data.guardian_id && data.guardian_first_name) {
    const { data: newGuardian, error: guardianError } = await supabase
      .from('patients')
      .insert({
        first_name: data.guardian_first_name.trim(),
        last_name: data.guardian_last_name?.trim() || '',
        mobile: data.guardian_mobile?.trim() || '',
        email: data.guardian_email?.trim() || null,
        id_type: (data.guardian_document_type || 'DPI').toLowerCase(),
        id_number: data.guardian_document_number?.trim() || null,
        clinic_id: profile.clinic_id,
        is_active: true
      })
      .select('id')
      .single()

    if (guardianError) {
      console.error('[createPatientWithGuardian] Error creating guardian:', guardianError)
      return { success: false, message: `Error al crear apoderado: ${guardianError.message}` }
    }

    guardianId = newGuardian.id
  }

  // Create patient
  const { data: newPatient, error: patientError } = await supabase
    .from('patients')
    .insert({
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      mobile: data.mobile.trim(),
      email: data.email?.trim() || null,
      id_type: data.document_type.toLowerCase(),
      id_number: data.document_number?.trim() || null,
      guardian_id: guardianId || null,
      guardian_relationship: data.guardian_relation || null,
      clinic_id: profile.clinic_id,
      is_active: true
    })

    .select('id')
    .single()

  if (patientError) {
    console.error('[createPatientWithGuardian] Error creating patient:', patientError)
    return { success: false, message: `Error al crear paciente: ${patientError.message}` }
  }

  revalidatePath('/dashboard/medical/patients')
  return { success: true, id: newPatient.id }
}
