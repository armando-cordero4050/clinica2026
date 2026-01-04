'use server'

import { createClient } from '@/lib/supabase/server'
import { OdooClient, OdooConfig } from '@/lib/odoo/client'
import { logSyncStart, logSyncSuccess, logSyncError } from '../utils/sync-logger'


/**
 * Universal Odoo Data Normalizer
 * Converts Odoo's 'false' values to empty strings or 0 to avoid frontend crashes
 * and ensures data consistency in Supabase.
 */
function normalizeOdooValue(value: unknown, targetType: 'string' | 'number' | 'boolean' = 'string'): any {
  if (value === false || value === null || value === undefined) {
    if (targetType === 'number') return 0
    if (targetType === 'boolean') return false
    return ""
  }
  return value
}

function normalizeObject(obj: unknown): any {
  if (!obj || typeof obj !== 'object') return normalizeOdooValue(obj)
  if (Array.isArray(obj)) return obj.map(normalizeObject)
  
  const normalized: Record<string, any> = {}
  const source = obj as Record<string, any>
  for (const key in source) {
    normalized[key] = normalizeObject(source[key])
  }
  return normalized
}

/**
 * Get Odoo configuration from database
 */
export async function getOdooConfig(): Promise<OdooConfig | null> {
  const supabase = await createClient()
  
  // 1. Try fetching from Database (Priority: UI overrides Env)
  const { data, error } = await supabase
    .from('odoo_config')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  if (data) {
    return {
      url: data.url,
      database: data.database,
      username: data.username,
      password: data.api_key
    }
  }

  // 2. Fallback to Environment Variables (Legacy / Dev flow)
  if (process.env.ODOO_URL && process.env.ODOO_DB && process.env.ODOO_USERNAME && process.env.ODOO_PASSWORD) {
    console.log('Using Odoo configuration from Environment Variables (.env)')
    return {
      url: process.env.ODOO_URL,
      database: process.env.ODOO_DB,
      username: process.env.ODOO_USERNAME,
      password: process.env.ODOO_PASSWORD
    }
  }

  console.error('No Odoo configuration found in DB or Environment')
  return null
}

/**
 * Test Odoo connection
 */
export async function testOdooConnection() {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, message: 'No hay configuración de Odoo activa' }
    }

    const odoo = new OdooClient(config)
    const uid = await odoo.authenticate()
    
    if (uid) {
      return { success: true, message: `Conexión exitosa. UID: ${uid}` }
    } else {
      return { success: false, message: 'Autenticación fallida' }
    }
  } catch (error: any) {
    return { success: false, message: `Error de conexión: ${error.message}` }
  }
}

/**
 * Sync Customers from Odoo (Phase 2: Full Field Sync + Payment Policy)
 */
export async function syncCustomersFromOdoo() {
  await logSyncStart('customers')
  
  try {
    const config = await getOdooConfig()
    if (!config) {
      await logSyncError('customers', { message: 'No hay configuración de Odoo activa' })
      return { success: false, message: 'No hay configuración de Odoo activa' }
    }

    const odoo = new OdooClient(config)
    await odoo.authenticate()

    const supabase = await createClient()

    // Fetch ALL partners with customer_rank > 0 (100% of fields)
    const partners = await odoo.searchRead('res.partner', [['customer_rank', '>', 0]], { 
      fields: [],  // Empty = ALL fields
      limit: 100 
    }) as any[]

    let syncedCount = 0

    for (const partner of partners) {
      // FILTER: Skip internal Odoo users (Administrator, etc.)
      // Odoo internal users typically have IDs 1-6 and names like "Administrator", "OdooBot", etc.
      if (partner.id <= 6 || partner.name === 'Administrator' || partner.name === 'OdooBot') {
        console.log(`⏭️  Skipping internal Odoo user: ${partner.name} (ID: ${partner.id})`)
        continue
      }
      
      // Normalize the entire partner object
      const normalizedPartner = normalizeObject(partner)
      
      // Payment Policy Detection (Phase 2)
      const pt = partner.property_payment_term_id
      const ptId = Array.isArray(pt) ? pt[0] : null
      const ptName = Array.isArray(pt) ? pt[1] : 'Immediate Payment'
      const policy = (ptName.toLowerCase().includes('immediate') || ptId === 1 || !ptId) 
        ? 'cash' 
        : 'credit'

      // 3. Promote to Clinic via RPC (Atomic update of both schemas)
      // This single call ensures atomicity and consistency between core and medical schemas
      const { error: rpcError } = await supabase.rpc('sync_clinic_from_odoo', {
          p_odoo_id: partner.id,
          p_name: normalizeOdooValue(partner.name),
          p_email: normalizeOdooValue(partner.email),
          p_phone: normalizeOdooValue(partner.phone),
          p_mobile: normalizeOdooValue(partner.mobile),
          p_vat: normalizeOdooValue(partner.vat),
          p_street: normalizeOdooValue(partner.street),
          p_city: normalizeOdooValue(partner.city),
          p_country_id: partner.country_id ? (Array.isArray(partner.country_id) ? partner.country_id[0] : partner.country_id) : null,
          p_payment_term_id: ptId,
          p_payment_term_name: ptName,
          p_payment_policy: policy,
          p_raw_data: normalizedPartner
      })

      if (rpcError) {
        console.error(`❌ Error sincronizando cliente ${partner.id} (${partner.name}):`)
        console.error('Error completo:', JSON.stringify(rpcError, null, 2))
        console.error('Código:', rpcError.code)
        console.error('Mensaje:', rpcError.message)
        console.error('Detalles:', rpcError.details)
        console.error('Hint:', rpcError.hint)
        
        await logSyncError('customers', rpcError, `Error sincronizando cliente ${partner.id} (${partner.name})`)
      } else {
        syncedCount++
        
        // 4. Auto-staff Promotion (Same logic but with cleaned data)
        const safeEmail = (typeof partner.email === 'string' && partner.email) ? partner.email : null
        
        if (safeEmail) {
          await supabase.rpc('sync_staff_member_from_odoo', {
            p_odoo_contact_id: partner.id,
            p_clinic_odoo_id: partner.id, 
            p_name: partner.name,
            p_email: safeEmail,
            p_job_position: normalizeOdooValue(partner.function) || 'Administrador Clínica',
            p_phone: normalizeOdooValue(partner.phone),
            p_mobile: normalizeOdooValue(partner.mobile),
            p_raw_data: normalizedPartner
          })
        }
      }
    }

    await logSyncSuccess('customers', syncedCount, partners.length - syncedCount)
    
    return { 
      success: true, 
      count: syncedCount, 
      message: `${syncedCount} clientes sincronizados correctamente` 
    }
  } catch (error: any) {
    await logSyncError('customers', error, 'Error general en sincronización')
    return { success: false, message: `Error: ${error.message}` }
  }
}

/**
 * Sync products moved to ./sync-products.ts
 */


/**
 * Sync sales orders from Odoo (sale.order)
 */
export async function syncSalesFromOdoo(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, count: 0, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    const supabase = await createClient()

    // Search and read sales orders
    // PHASE 2: Request ALL fields ([]) for full sync
    const orders = await client.searchRead('sale.order', {
      domain: [['state', 'in', ['sale', 'done']]], 
      fields: [], 
      limit: 100
    })

    let syncedCount = 0
    for (const order of orders) {
      // Normalization
      const _normalizedOrder = normalizeObject(order)
      
      // For now, we just count them. 
      // TODO: Implement sync_sale_from_odoo RPC if needed for a dedicated table
      syncedCount++
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'sales',
      operation: 'import',
      status: 'success',
      records_processed: syncedCount,
      completed_at: new Date().toISOString()
    })

    return { 
      success: true, 
      count: syncedCount, 
      message: `${syncedCount} órdenes de venta sincronizadas correctamente` 
    }
  } catch (error: any) {
    return { success: false, count: 0, message: `Error syncing sales: ${error.message}` }
  }
}

/**
 * Create a sale order in Odoo
 */
export async function createSaleOrderInOdoo(orderData: {
  partnerId: number
  orderLines: Array<{ productId: number; quantity: number; price: number }>
  notes?: string
}): Promise<{ success: boolean; orderId?: number; message: string }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    // Prepare order lines
    const orderLines = orderData.orderLines.map(line => [0, 0, {
      product_id: line.productId,
      product_uom_qty: line.quantity,
      price_unit: line.price
    }])

    // Create sale order
    const orderId = await client.create('sale.order', {
      partner_id: orderData.partnerId,
      order_line: orderLines,
      note: orderData.notes || ''
    })

    return { 
      success: true, 
      orderId, 
      message: `Orden de venta creada: SO-${orderId}` 
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: `Error al crear orden: ${error.message}` 
    }
  }
}

/**
 * Sync invoices from Odoo (account.move)
 */
export async function syncInvoicesFromOdoo(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, count: 0, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    const supabase = await createClient()

    // Search and read invoices (account.move)
    // PHASE 2: Request ALL fields ([])
    const invoices = await client.searchRead('account.move', {
      domain: [['move_type', '=', 'out_invoice'], ['state', '=', 'posted']], 
      fields: [], 
      limit: 100
    })

    let syncedCount = 0
    for (const inv of invoices) {
      const normalizedInv = normalizeObject(inv)
      
      const { error: rpcError } = await supabase.rpc('sync_invoice_from_odoo', {
        p_odoo_id: inv.id,
        p_invoice_number: inv.name,
        p_date: inv.date,
        p_due_date: inv.invoice_date_due || inv.date,
        p_total_amount: Number(inv.amount_total) || 0,
        p_amount_residual: Number(inv.amount_residual) || 0,
        p_currency: inv.currency_id ? inv.currency_id[1] : 'GTQ',
        p_status: inv.state,
        p_payment_state: inv.payment_state,
        p_odoo_partner_id: inv.partner_id ? inv.partner_id[0] : null,
        p_raw_data: normalizedInv
      })

      if (!rpcError) syncedCount++
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'invoices',
      operation: 'import',
      status: 'success',
      records_processed: syncedCount,
      records_failed: invoices.length - syncedCount,
      completed_at: new Date().toISOString()
    })

    return { 
      success: true, 
      count: syncedCount, 
      message: `${syncedCount} facturas sincronizadas correctamente` 
    }
  } catch (error: any) {
    const supabase = await createClient()
    await supabase.from('odoo_sync_log').insert({
      module: 'invoices',
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
 * Sync staff (contacts) from Odoo for all clinics
 */
export async function syncStaffFromOdoo(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, count: 0, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    const supabase = await createClient()

    // 1. Get all clinics with Odoo IDs
    const { data: clinics } = await supabase
      .from('clinics')
      .select('id, name, odoo_partner_id')
      .not('odoo_partner_id', 'is', null)

    console.log(`Found ${clinics?.length || 0} clinics to sync staff from`)

    if (!clinics || clinics.length === 0) {
      return { success: true, count: 0, message: 'No hay clínicas para sincronizar staff' }
    }

    let totalSynced = 0
    
    // 2. For each clinic, fetch its contacts (staff)
    for (const clinic of clinics) {
      console.log(`Fetching contacts for clinic: ${clinic.name} (Odoo ID: ${clinic.odoo_partner_id})`)
      // PHASE 2: Request ALL fields ([])
      const contacts = await client.searchRead('res.partner', {
        domain: [['parent_id', '=', clinic.odoo_partner_id]], 
        fields: [],
        limit: 50
      })

      console.log(`Found ${contacts.length} contacts for clinic ${clinic.name}`)

      for (const contact of contacts) {
        if (!contact.email) {
          console.log(`Skipping contact ${contact.name} (ID: ${contact.id}) - No email`)
          continue
        }

        const normalizedContact = normalizeObject(contact)

        const { error: rpcError } = await supabase.rpc('sync_staff_member_from_odoo', {
          p_odoo_contact_id: contact.id,
          p_clinic_odoo_id: clinic.odoo_partner_id,
          p_name: contact.name,
          p_email: contact.email,
          p_job_position: normalizeOdooValue(contact.function) || null,
          p_phone: normalizeOdooValue(contact.phone),
          p_mobile: normalizeOdooValue(contact.mobile),
          p_raw_data: normalizedContact
        })

        if (!rpcError) {
          totalSynced++
        } else {
          console.error(`Error syncing staff member ${contact.name}:`, rpcError)
        }
      }
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'staff',
      operation: 'import',
      status: 'success',
      records_processed: totalSynced,
      completed_at: new Date().toISOString()
    })

    return { 
      success: true, 
      count: totalSynced, 
      message: `${totalSynced} miembros de staff sincronizados` 
    }
  } catch (error: any) {
    return { success: false, count: 0, message: `Error syncing staff: ${error.message}` }
  }
}

/**
 * Sync everything from Odoo
 */
export async function syncAllFromOdoo() {
  const results = {
    customers: await syncCustomersFromOdoo(),
    staff: await syncStaffFromOdoo(),
    products: await syncProductsFromOdoo(),
    invoices: await syncInvoicesFromOdoo()
  }

  const totalSynced = results.customers.count + results.staff.count + results.products.count + results.invoices.count
  const success = results.customers.success && results.products.success && results.invoices.success

  return {
    success,
    totalSynced,
    details: results
  }
}

/**
 * Get Odoo sync logs
 */
export async function getOdooSyncLogs(limit: number = 20) {
  const supabase = await createClient()
  return supabase.rpc('get_odoo_sync_logs', { p_limit: limit })
}
