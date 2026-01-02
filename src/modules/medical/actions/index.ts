'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Patient {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  allergies: string[] | null
  created_at: string
}

export async function searchPatients(query: string = ''): Promise<Patient[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('search_patients_rpc', {
    p_query: query
  })

  if (error) {
    console.error('Error searching patients:', JSON.stringify(error, null, 2))
    return []
  }

  return data as Patient[]
}

export async function createPatient(data: {
  fullName: string
  email: string
  phone: string
  dob: string
}) {
  const supabase = await createClient()

  const { data: newId, error } = await supabase.rpc('create_patient_rpc', {
    p_full_name: data.fullName,
    p_email: data.email,
    p_phone: data.phone,
    p_dob: data.dob || null
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard/medical/patients')
  return { success: true, id: newId }
}
