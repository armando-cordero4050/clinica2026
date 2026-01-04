'use server'

import { createClient } from '@/lib/supabase/server'
import { OdooClient } from '@/lib/odoo/client'
import { getOdooConfig } from '@/modules/odoo/actions'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

interface CreateStaffParams {
  clinicId: string
  name: string
  email: string
  jobPosition: string
  phone?: string
  mobile?: string
  title?: string
  notes?: string
}

export async function createClinicStaff(params: CreateStaffParams) {
  logger.log('INICIO createClinicStaff', params)
  try {
    const supabase = await createClient()

    // 1. Get Clinic's Odoo ID
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('odoo_partner_id, name')
      .eq('id', params.clinicId)
      .single()

    if (clinicError || !clinic) {
      logger.error('Error seeking clinic', clinicError)
      return { success: false, message: 'Clínica no encontrada o error de base de datos' }
    }

    if (!clinic.odoo_partner_id) {
        logger.error('Clinic has no Odoo ID', clinic)
      return { success: false, message: 'Esta clínica no está sincronizada con Odoo. Sincronízala primero.' }
    }

    // 2. Connect to Odoo
    logger.debug('Connecting to Odoo...')
    console.log('🔹 [Debug] Conectando a Odoo...')
    const config = await getOdooConfig()
    if (!config) {
        logger.error('No Odoo Config')
        return { success: false, message: 'No hay configuración de Odoo activa' }
    }

    const odoo = new OdooClient(config)
    const uid = await odoo.authenticate()
    if (!uid) {
        logger.error('Odoo Auth Failed')
        return { success: false, message: 'Fallo de autenticación con Odoo' }
    }

    // 3. Create Contact in Odoo
    logger.debug('Authenticated. Preparing payload...')
    console.log('🔹 [Debug] Autenticado. Preparando payload...')
    
    const combinedNotes = [
        params.title ? `Título: ${params.title}` : null,
        params.notes
    ].filter(Boolean).join('\n')

    const contactData = {
        name: params.name,
        email: params.email,
        function: params.jobPosition,
        phone: params.phone || '',
        mobile: params.mobile || '',
        comment: combinedNotes,
        parent_id: clinic.odoo_partner_id,
        type: 'contact',
        customer_rank: 0,
        supplier_rank: 0
    }

    logger.debug('Sending to Odoo:', contactData)
    console.log('🔹 [Debug] Enviando a Odoo:', contactData)

    const newContactId = await odoo.create('res.partner', contactData)
    
    if (!newContactId) {
        logger.error('Odoo creation failed (no ID returned)')
        console.error('❌ [Error] Odoo create devolvió:', newContactId)
        return { success: false, message: 'Error al crear contacto en Odoo (No devolvió ID)' }
    }

    logger.log(`Created in Odoo ID: ${newContactId}. Syncing RPC...`)
    console.log(`✅ [Debug] Creado en Odoo ID: ${newContactId}. Iniciando Sync RPC...`)

    // 4. Sync back to DentalFlow
    const rpcParams = {
        p_odoo_contact_id: newContactId,
        p_clinic_odoo_id: clinic.odoo_partner_id,
        p_name: params.name,
        p_email: params.email,
        p_job_position: params.jobPosition,
        p_phone: params.phone || '',
        p_mobile: params.mobile || '',
        p_raw_data: { ...contactData, id: newContactId }
    }

    logger.debug('Params RPC', rpcParams)
    console.log('🔹 [Debug] Params RPC:', JSON.stringify(rpcParams, null, 2))

    const { data, error: rpcError } = await supabase.rpc('sync_staff_member_from_odoo', rpcParams)

    if (rpcError) {
        logger.error('RPC Error', rpcError)
        console.error('❌ [Error] RPC falló:', rpcError)
        return { success: false, message: `Creado en Odoo (${newContactId}) pero falló sync local: ${rpcError.message}` }
    }

    logger.log('Success Staff Created')
    console.log('✅ [Debug] Staff creado exitosamente en DB Local')
    revalidatePath(`/dashboard/medical/clinics/${params.clinicId}`)
    return { success: true, message: 'Staff creado exitosamente' }

  } catch (error: any) {
    logger.error('EXCEPTION in createClinicStaff', error)
    console.error('❌ Create Staff Error:', error)
    return { success: false, message: error.message || 'Error desconocido' }
  }
}
