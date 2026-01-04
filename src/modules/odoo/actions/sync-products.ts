'use server'

import { OdooClient } from '@/lib/odoo/client'
import { getOdooConfig } from './sync'
import { logSyncStart, logSyncSuccess, logSyncError } from '../utils/sync-logger'
import { createClient } from '@/lib/supabase/server'

interface OdooProduct {
  id: number
  name: string
  default_code: string | false
  list_price: number
  detailed_type: string
  categ_id: [number, string] | false
  active: boolean
}

export async function syncProductsFromOdoo() {
  const MODULE_NAME = 'products'
  
  try {
    // 0. Get Config
    const config = await getOdooConfig()
    if (!config) {
        throw new Error('Configuración Odoo no encontrada')
    }

    const odoo = new OdooClient(config)

    const logId = await logSyncStart(MODULE_NAME)
    console.log('📦 Starting Products Sync...')
    
    // 1. Connect to Odoo
    const uid = await odoo.authenticate()
    if (!uid) throw new Error('Fallo de autenticación Odoo')
    
    // 2. Fetch Products
    const products = await odoo.searchRead('product.template', [
      ['active', '=', true]
    ], {
       fields: [
        'id', 
        'name', 
        'default_code', 
        'list_price', 
        'detailed_type', 
        'categ_id'
       ]
    }) as unknown as OdooProduct[]
    
    console.log(`📦 Found ${products.length} products in Odoo`)

    // 3. Process & Save to Supabase
    const supabase = await createClient()
    let processed = 0
    let failed = 0
    let inserted = 0
    let updated = 0
    
    for (const p of products) {
      try {
        const payload = {
            p_odoo_id: p.id,
            p_name: p.name,
            p_code: p.default_code || '', // Empty string if false/null
            p_category: Array.isArray(p.categ_id) ? p.categ_id[1] : 'Unknown',
            p_price: p.list_price || 0,
            p_type: p.detailed_type || 'service',
            p_raw_data: p
        }

        const { data, error } = await supabase.rpc('sync_service_from_odoo', payload)

        if (error) {
            console.error(`❌ Failed to sync product ${p.id}:`, error)
            failed++
        } else {
            if (data?.action === 'inserted') inserted++
            else updated++ // Asumimos update si no es insert
            processed++
        }
      } catch (err) {
        console.error(`❌ Exception syncing product ${p.id}:`, err)
        failed++
      }
    }

    // 4. Log Result
    const successMsg = `Sync complete: ${processed} processed, ${failed} failed. (${inserted} new, ${updated} updated)`
    await logSyncSuccess(MODULE_NAME, processed, failed)
    
    return { 
        success: true, 
        message: successMsg, 
        stats: { processed, failed, inserted, updated } 
    }

  } catch (error: any) {
    console.error('❌ Critical Sync Error:', error)
    await logSyncError(MODULE_NAME, error)
    return { success: false, message: error.message }
  }
}
