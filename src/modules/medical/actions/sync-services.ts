'use server'

import { createClient } from '@/lib/supabase/server'

interface OdooService {
  id: string
  name: string
  description?: string
  category?: string
  image_url?: string
  cost_price_gtq: number
  cost_price_usd: number
  turnaround_days?: number
  is_active: boolean
}

/**
 * Sync services from Odoo for a specific clinic
 * Updates cost prices but preserves sale prices set by clinic
 */
export async function syncServicesFromOdoo(clinicId: string) {
  const supabase = await createClient()
  
  // Create sync log entry using RPC
  const { data: logId, error: logError } = await supabase
    .rpc('create_sync_log', {
      p_clinic_id: clinicId,
      p_triggered_by: 'auto'
    })

  if (logError || !logId) {
    console.error('Error creating sync log:', logError)
    return { success: false, message: 'Error al iniciar sincronización' }
  }

  try {
    // 1. Fetch services from Odoo (schema_lab.services)
    const { data: odooServices, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)

    if (fetchError) {
      throw new Error(`Error fetching Odoo services: ${fetchError.message}`)
    }

    if (!odooServices || odooServices.length === 0) {
      // Update log as success with 0 services
      await supabase.rpc('update_sync_log', {
        p_log_id: logId,
        p_status: 'success',
        p_services_fetched: 0,
        p_services_updated: 0,
        p_services_created: 0
      })

      return { success: true, message: 'No hay servicios para sincronizar', data: { fetched: 0, updated: 0, created: 0 } }
    }

    // 2. Get existing clinic service prices
    const { data: existingPrices } = await supabase
      .from('clinic_service_prices')
      .select('service_id, sale_price_gtq, sale_price_usd, margin_percentage')
      .eq('clinic_id', clinicId)

    const existingPricesMap = new Map(
      existingPrices?.map(p => [p.service_id, p]) || []
    )

    let updated = 0
    let created = 0

    // 3. Sync each service
    for (const service of odooServices as OdooService[]) {
      const existing = existingPricesMap.get(service.id)

      if (existing) {
        // UPDATE: Only update cost prices, preserve sale prices
        const { error: updateError } = await supabase
          .from('clinic_service_prices')
          .update({
            cost_price_gtq: service.cost_price_gtq,
            cost_price_usd: service.cost_price_usd,
            // Keep existing sale prices and margin
            updated_at: new Date().toISOString()
          })
          .eq('clinic_id', clinicId)
          .eq('service_id', service.id)

        if (!updateError) {
          updated++
        }
      } else {
        // CREATE: New service, set default sale price with 30% margin
        const defaultSaleGTQ = service.cost_price_gtq * 1.3
        const defaultSaleUSD = service.cost_price_usd * 1.3

        const { error: insertError } = await supabase
          .from('clinic_service_prices')
          .insert({
            clinic_id: clinicId,
            service_id: service.id,
            cost_price_gtq: service.cost_price_gtq,
            cost_price_usd: service.cost_price_usd,
            sale_price_gtq: defaultSaleGTQ,
            sale_price_usd: defaultSaleUSD,
            margin_percentage: 30,
            is_available: true,
            is_active: true
          })

        if (!insertError) {
          created++
        }
      }
    }

    // 4. Update sync log as success
    await supabase.rpc('update_sync_log', {
      p_log_id: logId,
      p_status: 'success',
      p_services_fetched: odooServices.length,
      p_services_updated: updated,
      p_services_created: created
    })

    return {
      success: true,
      message: `Sincronización completada: ${created} creados, ${updated} actualizados`,
      data: {
        fetched: odooServices.length,
        updated,
        created
      }
    }

  } catch (error: any) {
    // Update sync log as failed
    await supabase.rpc('update_sync_log', {
      p_log_id: logId,
      p_status: 'failed',
      p_error_message: error.message,
      p_error_details: { error: error.toString() }
    })

    console.error('Error syncing services:', error)
    return {
      success: false,
      message: `Error en sincronización: ${error.message}`
    }
  }
}

/**
 * Get last sync info for a clinic
 */
export async function getLastSyncInfo(clinicId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clinic_last_sync')
    .select('*')
    .eq('clinic_id', clinicId)
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, data }
}

/**
 * Manual sync trigger
 */
export async function triggerManualSync(clinicId: string) {
  return await syncServicesFromOdoo(clinicId)
}
