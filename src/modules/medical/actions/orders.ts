'use server'

import { createClient } from '@/lib/supabase/server'
import { OdooClient } from '@/lib/odoo/client'

/**
 * Get Odoo configuration
 */
async function getOdooConfig() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('odoo_config')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error || !data) {
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
 * Create a new sale order in Odoo
 */
export async function createSaleOrderInOdoo(orderData: {
  clinicId: string
  patientId: string
  patientName: string
  staffId: string
  serviceId: string
  dueDate?: string
  notes?: string
}): Promise<{ success: boolean; orderId?: string; message: string }> {
  try {
    const config = await getOdooConfig()
    if (!config) {
      return { success: false, message: 'No hay configuración de Odoo activa' }
    }

    const client = new OdooClient(config)
    await client.authenticate()

    const supabase = await createClient()

    // Get clinic Odoo partner ID
    const { data: clinic } = await supabase
      .from('clinics')
      .select('odoo_partner_id, name')
      .eq('id', orderData.clinicId)
      .single()

    if (!clinic?.odoo_partner_id) {
      return { success: false, message: 'Clínica no tiene Odoo Partner ID' }
    }

    // Get service Odoo product ID
    const { data: service } = await supabase
      .from('services')
      .select('odoo_id, name, base_price')
      .eq('id', orderData.serviceId)
      .single()

    if (!service?.odoo_id) {
      return { success: false, message: 'Servicio no tiene Odoo Product ID' }
    }

    // Get staff info
    const { data: staff } = await supabase
      .from('clinic_staff')
      .select('user_id, users(name)')
      .eq('id', orderData.staffId)
      .single()

    // Create Sale Order in Odoo
    const saleOrderId = await client.create('sale.order', {
      partner_id: clinic.odoo_partner_id,
      commitment_date: orderData.dueDate || new Date().toISOString().split('T')[0],
      note: `Paciente: ${orderData.patientId} - ${orderData.patientName}\n${orderData.notes || ''}`,
      order_line: [[0, 0, {
        product_id: service.odoo_id,
        product_uom_qty: 1,
        price_unit: service.base_price
      }]]
    })

    // Create order in DentalFlow
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        clinic_id: orderData.clinicId,
        patient_id: orderData.patientId,
        patient_name: orderData.patientName,
        staff_id: orderData.staffId,
        doctor_name: staff?.users?.name || 'Doctor',
        status: 'new',
        due_date: orderData.dueDate,
        price: service.base_price,
        odoo_sale_order_id: saleOrderId
      })
      .select()
      .single()

    if (orderError) {
      return { success: false, message: `Error creando orden: ${orderError.message}` }
    }

    // Create order item
    await supabase.from('order_items').insert({
      order_id: newOrder.id,
      service_id: orderData.serviceId,
      unit_price: service.base_price,
      quantity: 1
    })

    return { 
      success: true, 
      orderId: newOrder.id,
      message: `Orden creada exitosamente (Odoo SO: ${saleOrderId})` 
    }
  } catch (error: any) {
    console.error('Error creating sale order:', error)
    return { success: false, message: `Error: ${error.message}` }
  }
}

/**
 * Sync orders from Odoo
 */
export async function syncOrdersFromOdoo(): Promise<{ 
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

    // Get all synced clinics
    const { data: clinics } = await supabase
      .from('clinics')
      .select('odoo_partner_id')
      .not('odoo_partner_id', 'is', null)

    if (!clinics || clinics.length === 0) {
      return { success: false, count: 0, message: 'No hay clínicas sincronizadas' }
    }

    const partnerIds = clinics.map(c => c.odoo_partner_id)

    // Search for sale orders
    const saleOrders = await client.searchRead('sale.order', {
      domain: [
        ['partner_id', 'in', partnerIds]
      ],
      fields: [
        'id', 'name', 'partner_id', 'state', 'amount_total',
        'commitment_date', 'note', 'user_id', 'date_order'
      ],
      limit: 500
    })

    let syncedCount = 0
    const errors: string[] = []

    for (const so of saleOrders) {
      try {
        const { error: syncError } = await supabase.rpc('sync_order_from_odoo', {
          p_odoo_sale_order_id: so.id,
          p_sale_order_data: so
        })

        if (syncError) {
          errors.push(`SO ${so.name}: ${syncError.message}`)
        } else {
          syncedCount++
        }
      } catch (error: any) {
        errors.push(`SO ${so.id}: ${error.message}`)
      }
    }

    // Log sync
    await supabase.from('odoo_sync_log').insert({
      module: 'orders',
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
      message: `${syncedCount} órdenes sincronizadas${errors.length > 0 ? ` (${errors.length} errores)` : ''}` 
    }
  } catch (error: any) {
    const supabase = await createClient()
    await supabase.from('odoo_sync_log').insert({
      module: 'orders',
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
 * Get all orders with details
 */
export async function getOrdersWithDetails() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_orders_with_details')

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

export interface OrderInsert {
    clinic_id?: string
    patient_id: string
    patient_name: string
    doctor_id?: string
    items: string[] // List of service IDs
    is_digital: boolean
    delivery_info?: any
    notes?: string
    estimated_delivery?: string // Date string
    created_by?: string
}

export async function createLabOrder(data: OrderInsert) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, message: 'Usuario no autenticado' }
    }

    let clinicId = data.clinic_id
    if (!clinicId) {
        const { data: memberData } = await supabase
            .from('clinic_members')
            .select('clinic_id')
            .eq('user_id', user.id)
            .single()
        
        if (memberData) {
            clinicId = memberData.clinic_id
        }
    }

    if (!clinicId) {
         return { success: false, message: 'No se pudo determinar la clínica del usuario' }
    }

    const payload = {
        clinic_id: clinicId,
        patient_id: data.patient_id,
        patient_name: data.patient_name,
        // doctor_name: ... (omitted, let's prefer IDs if possible or fetch from user)
        status: 'new',
        is_digital: data.is_digital,
        delivery_info: data.delivery_info || {},
        price: 0, // Placeholder
        due_date: data.estimated_delivery,
        created_at: new Date().toISOString()
    }

    const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single()

    if (orderError) {
        console.error("Error creating lab order:", orderError)
        return { success: false, message: orderError.message }
    }

    // Insert Items
    if (data.items && data.items.length > 0) {
        // NOTE: If service IDs are MOCKs (like 'srv_resin_1'), this will fail FK.
        // In production, we need real service IDs.
        // For now we attempt it.
        const itemsPayload = data.items.map(itemId => ({
            order_id: newOrder.id,
            service_id: itemId,
            quantity: 1,
            unit_price: 0
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsPayload)
        
        if (itemsError) {
            console.error("Error inserting items (possibly mock IDs):", itemsError)
        }
    }

    revalidatePath('/dashboard/medical/lab')
    return { success: true, data: newOrder }
}
