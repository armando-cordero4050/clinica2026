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
 * Sync lab services from Odoo products
 * Filters: Products starting with "LD" OR category contains "lab", "laboratorio", "LD"
 */
export async function syncServicesFromOdoo(): Promise<{ 
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

    // Search for products with LD prefix or lab category
    const products = await client.searchRead('product.product', {
      domain: [
        '|', '|', '|',
        ['default_code', '=like', 'LD%'],
        ['categ_id', 'ilike', 'lab'],
        ['categ_id', 'ilike', 'laboratorio'],
        ['categ_id', 'ilike', 'dental']
      ],
      fields: [
        'id', 'name', 'default_code', 'list_price', 
        'categ_id', 'active', 'type'
      ],
      limit: 500
    })

    let syncedCount = 0
    const errors: string[] = []

    for (const product of products) {
      try {
        // Sync service
        const { data: serviceId, error: syncError } = await supabase.rpc('sync_service_from_odoo', {
          p_odoo_product_id: product.id,
          p_product_data: product
        })

        if (syncError) {
          console.error(`Error syncing service ${product.name}:`, syncError)
          errors.push(`${product.name}: ${syncError.message}`)
        } else {
          syncedCount++
        }
      } catch (error: any) {
        console.error(`Error processing product ${product.id}:`, error)
        errors.push(`${product.name}: ${error.message}`)
      }
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'services',
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
      message: `${syncedCount} servicios sincronizados correctamente${errors.length > 0 ? ` (${errors.length} errores)` : ''}` 
    }
  } catch (error: any) {
    // Log error
    const supabase = await createClient()
    await supabase.from('odoo_sync_log').insert({
      module: 'services',
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
 * Get all synced services
 */
export async function getSyncedServices() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .not('odoo_id', 'is', null)
    .order('name')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data || []
}
