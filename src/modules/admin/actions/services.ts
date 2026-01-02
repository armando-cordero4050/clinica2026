'use server'

import { createClient } from '@/lib/supabase/server'
import { OdooClient } from '@/lib/odoo/client'

export async function getAdminServices() {
    const supabase = await createClient()

    const { data: services, error } = await supabase
        .from('services') // schema_lab.services via public view
        .select('*')
        .order('name')

    if (error) {
        console.error("Error fetching admin services:", error)
        return []
    }

    return services
}

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
 * Sync all services (products) from Odoo
 */
export async function syncServicesFromOdoo(): Promise<{ 
  success: boolean
  count: number
  message: string 
}> {
    // Import from the central sync module to unify logic
    const { syncProductsFromOdoo } = await import('@/modules/odoo/actions/sync')
    return syncProductsFromOdoo()
}
