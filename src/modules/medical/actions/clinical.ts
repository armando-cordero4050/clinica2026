'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ToothCondition {
  tooth_number: number
  surface: string
  condition: string
  notes?: string
  updated_at: string
  lab_order_id?: string
}

/**
 * Get the dental chart (current state) for a patient.
 */
export async function getPatientDentalChart(patientId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_patient_dental_chart', { p_patient_id: patientId })

  if (error) {
    console.error('[getPatientDentalChart] Error:', error)
    return { success: false, message: error.message, data: [] }
  }

  return { success: true, data: data as ToothCondition[] }
}

/**
 * Save a tooth condition (Evolution/update of odontogram).
 * This updates the "current state" of the patient's mouth.
 */
export async function saveToothCondition(data: {
  patient_id: string
  tooth_number: number
  surface: string
  condition: string
  notes?: string
}) {
  const supabase = await createClient()

  // We use the RPC upsert_tooth_condition which handles clinic_id logic safely
  const { data: newId, error } = await supabase
    .rpc('upsert_tooth_condition', {
      p_patient_id: data.patient_id,
      p_tooth_number: data.tooth_number,
      p_surface: data.surface,
      p_condition: data.condition,
      p_notes: data.notes
    })

  if (error) {
    console.error('[saveToothCondition] Error:', error)
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/medical/patients/${data.patient_id}`)
  return { success: true, id: newId }
}

/**
 * Create a new clinical evolution note (History).
 * Can be linked to an appointment or just standalone.
 */
export async function createEvolution(data: {
  patient_id: string
  doctor_id?: string
  appointment_id?: string
  description: string
  diagnosis?: string
  treatment_plan?: string
}) {
  const supabase = await createClient()
  
  // Get clinic_id (could be moved to a shared utils or middleware check)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Unauthorized' }

  // We can fetch clinic_id via single query or trusted session helper, 
  // but RLS policies on INSERT require clinic_id to be correct. 
  // We need to fetch it first effectively.
  // Ideally, use a secure RPC or lookup. 
  // For now, let's lookup clinic_staff.
  const { data: staff } = await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()
      
  if (!staff) return { success: false, message: 'No clinic association found' }

  const { data: newEvolution, error } = await supabase
    .from('evolutions')
    .insert({
      clinic_id: staff.clinic_id,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id || user.id, // Default to current user if not provided
      appointment_id: data.appointment_id,
      description: data.description,
      diagnosis: data.diagnosis,
      treatment_plan: data.treatment_plan
    })
    .select()
    .single()

  if (error) {
     console.error('[createEvolution] Error:', error)
     return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/medical/patients/${data.patient_id}`)
  return { success: true, data: newEvolution }
}

export async function getPatientEvolutions(patientId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('evolutions')
        .select(`
            *,
            doctor:doctor_id ( email )
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false })

    if (error) {
        return { success: false, message: error.message, data: [] }
    }

    return { success: true, data }
}
