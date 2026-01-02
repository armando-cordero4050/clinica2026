'use server'

import { createClient } from '@/lib/supabase/server'

export interface ClinicDoctor {
    id: string
    user_id: string
    name: string
    role: string
    is_primary: boolean
}

export async function getClinicDoctors() {
    const supabase = await createClient()

    // Get current user's clinic implicitly via RLS or logic
    // We filter by roles that consider "Doctor"
    
    // Join with schema_core.users to get names
    const { data, error } = await supabase
        .from('clinic_staff')
        .select(`
            id,
            user_id,
            role,
            is_primary,
            users:schema_core.users!user_id (
                name,
                email
            )
        `)
        .in('role', ['clinic_doctor', 'clinic_admin', 'dentist']) 
        // Assuming 'clinic_admin' might also be a doctor, or specific 'clinic_doctor' role exists.
        // Based on previous file view: role IN ('clinic_admin', 'clinic_doctor', 'clinic_staff', 'clinic_receptionist')

    if (error) {
        console.error("Error fetching doctors:", error)
        return []
    }

    // Flatten structure
    return data.map((staff: any) => ({
        id: staff.id, // staff ID
        user_id: staff.user_id,
        name: staff.users?.name || staff.users?.email || 'Dr. Sin Nombre',
        role: staff.role,
        is_primary: staff.is_primary
    }))
}
