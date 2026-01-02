'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPatientOdontogram(patientId: string) {
  const supabase = await createClient()
  
  // 1. Get Patient Details (Reuse RPC or direct query if RLS permits)
  // We'll use a direct query for patient info since it's simple select
  const { data: patient, error: pError } = await supabase
    .schema('schema_medical')
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single()

  if (pError) {
    console.error('Error fetching patient:', pError)
    return null
  }

  // 2. Get Odontogram State via RPC
  const { data: teethState, error: oError } = await supabase.rpc('get_odontogram_rpc', {
    p_patient_id: patientId
  })

  if (oError) {
    console.error('Error fetching odontogram:', oError)
  }

  return {
    patient,
    teethState: teethState || {} // Return empty object if null
  }
}

export async function saveOdontogram(patientId: string, teethState: any) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('save_odontogram_rpc', {
    p_patient_id: patientId,
    p_teeth_state: teethState
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/dashboard/medical/patients/${patientId}`)
  return { success: true }
}
