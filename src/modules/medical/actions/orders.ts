'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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
        doctor_name: (staff as any)?.users?.[0]?.name || (staff as any)?.users?.name || 'Doctor',
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
    delivery_type: 'digital' | 'pickup' | 'shipping'
    digital_files?: File[]
    shipping_info?: {
        courier: string
        tracking_number: string
    }
    notes?: string
    estimated_delivery?: string // Date string (auto-calculated, for reference)
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
        // 1. Try to get from user's staff record
        const { data: memberData } = await supabase
            .from('clinic_staff')
            .select('clinic_id')
            .eq('user_id', user.id)
            .single()
        
        if (memberData) {
            clinicId = memberData.clinic_id
        }
    }

    // 2. Fallback: Get from patient record
    if (!clinicId && data.patient_id) {
        const { data: patientData } = await supabase
            .from('patients')
            .select('clinic_id')
            .eq('id', data.patient_id)
            .single()
        
        if (patientData) {
            clinicId = patientData.clinic_id
        }
    }

    if (!clinicId) {
         return { success: false, message: 'No se pudo determinar la clínica asociada (Usuario o Paciente)' }
    }

    // Upload digital files to Supabase Storage (if any)
    let digitalFilesUrls: any[] = []
    if (data.delivery_type === 'digital' && data.digital_files && data.digital_files.length > 0) {
        console.log('🔵 Uploading', data.digital_files.length, 'digital files...')
        
        for (const file of data.digital_files) {
            const fileName = `${Date.now()}-${file.name}`
            const filePath = `lab-orders/${clinicId}/${fileName}`
            
            // Convert File to ArrayBuffer for upload
            const arrayBuffer = await file.arrayBuffer()
            const buffer = new Uint8Array(arrayBuffer)
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('lab-files')
                .upload(filePath, buffer, {
                    contentType: file.type,
                    upsert: false
                })
            
            if (uploadError) {
                console.error('🔴 Error uploading file:', uploadError)
                return { success: false, message: `Error al subir archivo: ${file.name}` }
            }
            
            // Get public URL
            const { data: urlData } = supabase.storage
                .from('lab-files')
                .getPublicUrl(filePath)
            
            digitalFilesUrls.push({
                name: file.name,
                url: urlData.publicUrl,
                size: file.size,
                type: file.type,
                uploaded_at: new Date().toISOString()
            })
        }
        
        console.log('✅ Files uploaded successfully:', digitalFilesUrls.length)
    }

    console.log('🔵 createLabOrder - Using RPC with params:', {
        p_clinic_id: clinicId,
        p_patient_id: data.patient_id,
        p_patient_name: data.patient_name,
        p_service_ids: data.items,
        p_delivery_type: data.delivery_type,
        p_digital_files: digitalFilesUrls,
        p_shipping_info: data.shipping_info,
        p_notes: data.notes
    })

    // Use RPC to create order (bypasses RLS with SECURITY DEFINER)
    const { data: orderId, error: rpcError } = await supabase.rpc('create_lab_order_rpc', {
        p_clinic_id: clinicId,
        p_patient_id: data.patient_id,
        p_patient_name: data.patient_name,
        p_service_ids: data.items,
        p_delivery_type: data.delivery_type,
        p_digital_files: digitalFilesUrls,
        p_shipping_info: data.shipping_info || null,
        p_notes: data.notes || null
    })

    if (rpcError) {
        console.error("🔴 Error creating lab order via RPC:", rpcError)
        return { success: false, message: rpcError.message }
    }

    console.log('✅ Lab order created successfully, ID:', orderId)

    revalidatePath('/dashboard/medical/lab')
    revalidatePath('/dashboard/medical/patients')
    revalidatePath('/dashboard/lab')
    return { success: true, data: { id: orderId } }
}

export async function getClinicOrders(clinicId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
        .from('orders') // Uses public view
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching clinic orders:', error)
        return []
    }

    return data || []
}
