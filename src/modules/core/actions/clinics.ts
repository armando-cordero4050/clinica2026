'use server'

import { createClient } from '@/lib/supabase/server'

export async function getClinicsWithPatientCount() {
    const supabase = await createClient()

    // Assuming we have RLS permissions as 'super_admin' to see all clinics
    // and count their patients.
    // Since RLS on patients table usually isolates by clinic_id, a super_admin might NOT count them directly
    // unless RLS policy allows it or we use a secure view/function.
    // For this MVP validation, let's assume Super Admin bypasses or has policy.
    // OR we use a security definer RPC.

    // Let's try direct query first.
    // Note: Counting patients across clinics efficiently requires a GROUP BY.
    
    /* 
       We need: 
       Clinic Name, Total Patients
    */
    
    // Fetch clinics
    const { data: clinics, error } = await supabase
        .from('clinics')
        .select('*')
        .order('name')

    if (error) {
        console.error("Error fetching clinics", error)
        return []
    }

    // Now for each clinic, count patients. 
    // This is N+1 but acceptable for MVP with few clinics.
    // A better way would be an RPC `get_clinics_stats`.
    
    // Let's create an RPC on the fly? No.
    // Try to count. RLS will verify if I can see them.
    
    const clinicsWithStats = await Promise.all(clinics.map(async (c) => {
        const { count, error: countError } = await supabase
            .from('patients') // schema_medical.patients via view
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', c.id) // This filter might be redundant if RLS forces it, BUT if I am super_admin I want to see specific clinic.
        
        // If RLS prevents seeing other clinics' patients, this count will be 0 or equal to MY clinic.
        // We will test and see.
        return {
            ...c,
            patientCount: count || 0
        }
    }))

    return clinicsWithStats
}
export async function getAdminGlobalStats() {
    const supabase = await createClient()
    
    const { count: clinicsCount } = await supabase
        .from('clinics')
        .select('*', { count: 'exact', head: true })

    const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

    const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

    return {
      clinics: clinicsCount || 0,
      patients: patientsCount || 0,
      orders: ordersCount || 0
    }
}
