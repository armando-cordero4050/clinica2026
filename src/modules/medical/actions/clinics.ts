'use server'

import { createClient } from '@/lib/supabase/server'
import { OdooClient } from '@/lib/odoo/client'

/**
 * Get Odoo configuration from database
 */
async function getOdooConfig() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('odoo_config')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error || !data) {
    console.error('No active Odoo configuration found:', error)
    return null
  }

  return {
    url: data.url,
    database: data.database,
    username: data.username,
    password: data.api_key
  }
}

/**
 * Sync all clinics (partners) from Odoo
 */
export async function syncClinicsFromOdoo(): Promise<{ 
  success: boolean
  count: number
  message: string 
}> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, count: 0, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    const supabase = await createClient()

    // Search for partners that are customers
    const partners = await client.searchRead('res.partner', {
      domain: [
        ['customer_rank', '>', 0],
        ['is_company', '=', true]
      ],
      fields: [
        'id', 'name', 'email', 'phone', 'mobile', 'street', 
        'city', 'country_id', 'vat', 'website', 'child_ids'
      ],
      limit: 100
    })

    let syncedCount = 0
    const errors: string[] = []

    for (const partner of partners) {
      try {
        // Get child contacts (staff)
        let contacts: any[] = []
        if (partner.child_ids && partner.child_ids.length > 0) {
          contacts = await client.read('res.partner', partner.child_ids, [
            'id', 'name', 'email', 'phone', 'mobile', 'function'
          ])
        }

        // Sync clinic with contacts
        const { error: syncError } = await supabase.rpc('sync_clinic_from_odoo', {
          p_odoo_partner_id: partner.id,
          p_partner_data: partner,
          p_contacts: contacts
        })

        if (syncError) {
          console.error(`Error syncing clinic ${partner.name}:`, syncError)
          errors.push(`${partner.name}: ${syncError.message}`)
        } else {
          syncedCount++
        }
      } catch (error: any) {
        console.error(`Error processing partner ${partner.id}:`, error)
        errors.push(`${partner.name}: ${error.message}`)
      }
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'clinics',
      operation: 'import',
      status: errors.length === 0 ? 'success' : (syncedCount > 0 ? 'partial' : 'error'),
      records_processed: syncedCount,
      records_failed: errors.length,
      error_message: errors.length > 0 ? errors.join('\n') : null,
      completed_at: new Date().toISOString()
    })

    return { 
      success: true, 
      count: syncedCount, 
      message: `${syncedCount} clínicas sincronizadas correctamente${errors.length > 0 ? ` (${errors.length} errores)` : ''}` 
    }
  } catch (error: any) {
    // Log error
    const supabase = await createClient()
    await supabase.from('odoo_sync_log').insert({
      module: 'clinics',
      operation: 'import',
      status: 'error',
      records_processed: 0,
      error_message: error.message,
      completed_at: new Date().toISOString()
    })

    return { 
      success: false, 
      count: 0, 
      message: `Error: ${error.message}` 
    }
  }
}

/**
 * Get the clinic associated with the current user
 */
export async function getUserClinic() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No authenticated user', data: null }
  }

  console.log('Fetching clinic for user:', user.id)

  // First, get user's clinic_staff record to get the clinic_id
  const { data: staffRecord, error: staffError } = await supabase
    .from('clinic_staff')
    .select('clinic_id')
    .eq('user_id', user.id)
    .single()

  console.log('Clinic staff record:', { staffRecord, staffError })

  if (staffError || !staffRecord) {
    // This is expected for admins or users not assigned to any clinic, no need to log error
    return { success: false, error: 'No clinic found for user', data: null }
  }

  // Then, get the clinic details
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', staffRecord.clinic_id)
    .single()

  console.log('Clinic record:', { clinic, clinicError })

  if (clinicError || !clinic) {
    console.error('Error fetching clinic details:', clinicError)
    return { success: false, error: 'Clinic not found', data: null }
  }

  return { 
    success: true, 
    data: clinic 
  }
}

/**
 * Get all synced clinics
 */
export async function getSyncedClinics() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .not('odoo_partner_id', 'is', null)
    .order('name')

  if (error) {
    console.error('Error fetching clinics:', error)
    return []
  }

  return data || []
}

/**
 * Get clinic details with staff
 */
export async function getClinicDetails(clinicId: string) {
  const supabase = await createClient()
  
  console.log('Fetching clinic with ID:', clinicId)
  
  // Get clinic data from public view
  const { data: clinic, error: clinicError } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single()

  console.log('Clinic query result:', { clinic, error: clinicError })

  if (clinicError) {
    console.error('Error fetching clinic:', clinicError)
    console.error('Error details:', JSON.stringify(clinicError, null, 2))
    return null
  }

  if (!clinic) {
    console.log('No clinic found with ID:', clinicId)
    return null
  }

  // Get staff data from public view
  const { data: staff, error: staffError } = await supabase
    .from('clinic_staff')
    .select(`
      id,
      user_id,
      role,
      is_primary,
      odoo_contact_id,
      title,
      job_position,
      phone,
      mobile
    `)
    .eq('clinic_id', clinicId)

  console.log('Staff query result:', { staffCount: staff?.length, error: staffError })

  if (staffError) {
    console.error('Error fetching staff:', staffError)
  }

  // Get user details for staff
  const staffWithUsers = await Promise.all(
    (staff || []).map(async (s) => {
      const { data: user } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', s.user_id)
        .single()
      
      return {
        id: s.id,
        user_id: s.user_id,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        role: s.role,
        is_primary: s.is_primary,
        odoo_contact_id: s.odoo_contact_id,
        title: s.title,
        job_position: s.job_position,
        phone: s.phone,
        mobile: s.mobile
      }
    })
  )

  return {
    clinic,
    staff: staffWithUsers
  }
}

/**
 * Update staff role
 */
export async function updateStaffRole(staffId: string, newRole: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('update_clinic_staff_role', {
    p_staff_id: staffId,
    p_new_role: newRole
  })

  if (error) {
    console.error('Error updating staff role:', error)
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Rol actualizado correctamente' }
}

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Reset staff password
 * Uses Admin API to ensure user exists in auth.users and password is set correctly.
 */
export async function resetStaffPassword(userId: string, newPassword: string) {
  const adminClient = createAdminClient()
  
  // 1. Get user email and current data from our table using Admin Client to bypass RLS
  const { data: userData, error: userError } = await adminClient
    .from('users') 
    .select('email, name, role')
    .eq('id', userId)
    .single()

  if (userError || !userData) {
    console.error('Error finding user for password reset:', userError)
    return { success: false, message: 'No se encontró el usuario en la base de datos' }
  }

  const { email, name, role } = userData

  try {
    // 2. Try to find user in auth.users by ID first, then by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()
    if (listError) throw listError

    // Check if auth user exists with this exact ID
    let authUser = users.find(u => u.id === userId)
    
    // If not found by ID, search by email (user might not be activated yet)
    if (!authUser) {
      authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    }

    if (authUser) {
      // 3a. Update existing auth user
      console.log(`Updating existing auth user: ${email} (ID: ${authUser.id})`)
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        authUser.id,
        { 
          password: newPassword,
          user_metadata: { role, name },
          email_confirm: true 
        }
      )
      if (updateError) throw updateError
    } else {
      // 3b. Create new auth user with the same ID as our core user
      console.log(`Creating new auth user for: ${email} with ID: ${userId}`)
      const { error: createError } = await adminClient.auth.admin.createUser({
        id: userId, // Use the same ID to maintain consistency
        email,
        password: newPassword,
        user_metadata: { role, name },
        email_confirm: true
      })
      if (createError) throw createError
    }

    return { success: true, message: 'Contraseña actualizada y acceso habilitado' }
  } catch (error: any) {
    console.error('Error in Admin password reset:', error)
    return { success: false, message: `Error de administración: ${error.message}` }
  }
}
