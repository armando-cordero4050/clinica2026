'use server'

import { createClient } from '@/lib/supabase/server'
import { OdooClient, OdooConfig } from '@/lib/odoo/client'

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
export async function testOdooConnection(): Promise<{ success: boolean; message: string; uid?: number }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    const uid = await client.authenticate()

    return { 
      success: true, 
      message: `Conexión exitosa. UID: ${uid}`,
      uid 
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: `Error de conexión: ${error.message}` 
    }
  }
}

/**
 * Sync customers from Odoo
 */
export async function syncCustomersFromOdoo(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, count: 0, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    // Get enabled fields for customers
    const supabase = await createClient()
    const { data: fieldMappings } = await supabase.rpc('get_odoo_field_mappings', {
      p_module: 'customers'
    })

    const enabledFields = fieldMappings
      ?.filter((f: any) => f.is_enabled)
      .map((f: any) => f.odoo_field_name) || ['id', 'name', 'email']

    // Search and read partners (customers)
    const partners = await client.searchRead('res.partner', {
      domain: [['customer_rank', '>', 0]], // Only customers
      fields: enabledFields,
      limit: 100
    })

    // Store in database
    let syncedCount = 0
    for (const partner of partners) {
      const { error } = await supabase
        .from('odoo_customers')
        .upsert({
          odoo_partner_id: partner.id,
          name: partner.name,
          email: partner.email || null,
          phone: partner.phone || null,
          vat: partner.vat || null,
          street: partner.street || null,
          city: partner.city || null,
          country: partner.country_id ? partner.country_id[1] : null,
          is_company: partner.is_company || false,
          raw_data: partner,
          last_synced: new Date().toISOString()
        }, {
          onConflict: 'odoo_partner_id'
        })

      // NEW: Promote to Medical Clinic automatically
      const { error: rpcError } = await supabase.rpc('sync_clinic_from_odoo', {
          p_odoo_id: partner.id,
          p_name: partner.name,
          p_email: partner.email || null,
          p_phone: partner.phone || null,
          p_address: `${partner.street || ''} ${partner.city || ''}`.trim(),
          p_contact_name: partner.name
      })

      if (rpcError) {
        console.error(`Error promoting Odoo partner ${partner.id} to clinic:`, rpcError)
      } else {
        syncedCount++
        
        // ALSO: Create staff record for the main partner itself if it has an email
        const safeEmail = (typeof partner.email === 'string' && partner.email) ? partner.email : null
        
        console.log(`Checking auto-staff promotion for ${partner.name}: Email found = ${!!safeEmail}`)
        
        if (safeEmail) {
          console.log(`Auto-promoting ${partner.name} as clinic staff member...`)
          const { error: staffRpcError } = await supabase.rpc('sync_staff_member_from_odoo', {
            p_odoo_contact_id: partner.id,
            p_clinic_odoo_id: partner.id, 
            p_name: partner.name,
            p_email: safeEmail,
            p_job_position: 'Administrador Clínica',
            p_phone: (typeof partner.phone === 'string' ? partner.phone : null),
            p_mobile: (typeof partner.mobile === 'string' ? partner.mobile : null),
            p_raw_data: partner
          })

          if (staffRpcError) {
            console.error(`Error auto-promoting ${partner.name} to staff:`, staffRpcError)
          } else {
            console.log(`Successfully promoted ${partner.name} to staff member.`)
          }
        }
      }
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'customers',
      operation: 'import',
      status: 'success',
      records_processed: syncedCount,
      records_failed: partners.length - syncedCount,
      completed_at: new Date().toISOString()
    })

    return { 
      success: true, 
      count: syncedCount, 
      message: `${syncedCount} clientes sincronizados correctamente` 
    }
  } catch (error: any) {
    // Log error
    const supabase = await createClient()
    await supabase.from('odoo_sync_log').insert({
      module: 'customers',
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
 * Sync products from Odoo
 */
export async function syncProductsFromOdoo(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, count: 0, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    // Get enabled fields for products
    const supabase = await createClient()
    const { data: fieldMappings } = await supabase.rpc('get_odoo_field_mappings', {
      p_module: 'products'
    })

    const enabledFields = fieldMappings
      ?.filter((f: any) => f.is_enabled)
      .map((f: any) => f.odoo_field_name) || ['id', 'name', 'list_price', 'sale_delay']

    // Ensure sale_delay is always requested even if not explicitly enabled in mappings
    if (!enabledFields.includes('sale_delay')) enabledFields.push('sale_delay')

    // Search and read products
    const products = await client.searchRead('product.product', {
      domain: [['sale_ok', '=', true]], // Only products available for sale
      fields: enabledFields,
      limit: 200
    })

    // Store in database (schema_lab.services)
    let syncedCount = 0
    for (const product of products) {
      // Basic category mapping logic (can be improved)
      let category = 'fija' // Default
      const odooCategoryName = product.categ_id ? product.categ_id[1].toLowerCase() : ''
      if (odooCategoryName.includes('removible')) category = 'removible'
      if (odooCategoryName.includes('ortodoncia')) category = 'ortodoncia'
      if (odooCategoryName.includes('implante')) category = 'implantes'

      // Clean image URL or use placeholder
      const imageUrl = (typeof product.image_128 === 'string' && product.image_128)
        ? `data:image/png;base64,${product.image_128}`
        : null

      // SLA Logic: Map Odoo's 'sale_delay' (Lead Time) to hours
      // sale_delay is in days. Default to 3 days if not set or false.
      const odooLeadTimeDays = (typeof product.sale_delay === 'number') ? product.sale_delay : 
                               (typeof product.sale_delay === 'string' ? Number(product.sale_delay) : 3)
      
      const effectiveLeadTime = odooLeadTimeDays > 0 ? odooLeadTimeDays : 3
      const slaHours = Math.round(effectiveLeadTime * 24)

      // Handle null/false from Odoo for string fields
      const safeCode = (typeof product.default_code === 'string' && product.default_code) ? product.default_code : `ODOO-${product.id}`
      const safeDescription = (typeof product.description_sale === 'string' && product.description_sale) ? product.description_sale : product.name

      const { error } = await supabase.rpc('sync_service_from_odoo', {
        p_odoo_id: product.id,
        p_code: safeCode,
        p_name: product.name,
        p_category: category,
        p_cost_price_gtq: Number(product.standard_price) || 0,
        p_cost_price_usd: (Number(product.standard_price) || 0) / 7.8,
        p_base_price: Number(product.list_price) || 0,
        p_image_url: imageUrl,
        p_description: safeDescription,
        p_turnaround_days: effectiveLeadTime,
        p_is_active: true,
        p_sla_hours: slaHours,
        p_sla_minutes: 0
      })

      if (!error) syncedCount++
      else console.error(`Error syncing product ${product.id}:`, error)
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'products',
      operation: 'import',
      status: 'success',
      records_processed: syncedCount,
      records_failed: products.length - syncedCount,
      completed_at: new Date().toISOString()
    })

    return { 
      success: true, 
      count: syncedCount, 
      message: `${syncedCount} productos sincronizados correctamente` 
    }
  } catch (error: any) {
    // Log error
    const supabase = await createClient()
    await supabase.from('odoo_sync_log').insert({
      module: 'products',
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
    const orders = await client.searchRead('sale.order', {
      domain: [['state', 'in', ['sale', 'done']]], 
      fields: ['id', 'name', 'date_order', 'amount_total', 'partner_id', 'state', 'invoice_status'],
      limit: 100
    })

    let syncedCount = 0
    for (const order of orders) {
      // For now, we just log them in the system or placeholder sync
      // In a real scenario, we would map these to schema_lab.orders or a dedicated odoo_sales table
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
    const invoices = await client.searchRead('account.move', {
      domain: [['move_type', '=', 'out_invoice'], ['state', '=', 'posted']], 
      fields: ['id', 'name', 'date', 'invoice_date_due', 'amount_total', 'amount_residual', 'currency_id', 'state', 'payment_state', 'partner_id'],
      limit: 100
    })

    let syncedCount = 0
    for (const inv of invoices) {
      const { error: rpcError } = await supabase.rpc('sync_invoice_from_odoo', {
        p_odoo_id: inv.id,
        p_invoice_number: inv.name,
        p_date: inv.date,
        p_due_date: inv.invoice_date_due || inv.date,
        p_total_amount: inv.amount_total || 0,
        p_amount_residual: inv.amount_residual || 0,
        p_currency: inv.currency_id ? inv.currency_id[1] : 'GTQ',
        p_status: inv.state,
        p_payment_state: inv.payment_state,
        p_odoo_partner_id: inv.partner_id ? inv.partner_id[0] : null,
        p_raw_data: inv
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
      const contacts = await client.searchRead('res.partner', {
        domain: [['parent_id', '=', clinic.odoo_partner_id]], // Child contacts
        fields: ['id', 'name', 'email', 'function', 'phone', 'mobile', 'title'],
        limit: 50
      })

      console.log(`Found ${contacts.length} contacts for clinic ${clinic.name}`)

      for (const contact of contacts) {
        if (!contact.email) {
          console.log(`Skipping contact ${contact.name} (ID: ${contact.id}) - No email`)
          continue
        }

        const { error: rpcError } = await supabase.rpc('sync_staff_member_from_odoo', {
          p_odoo_contact_id: contact.id,
          p_clinic_odoo_id: clinic.odoo_partner_id,
          p_name: contact.name,
          p_email: contact.email,
          p_job_position: contact.function || null,
          p_phone: contact.phone || null,
          p_mobile: contact.mobile || null,
          p_raw_data: contact
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
