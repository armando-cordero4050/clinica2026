'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Service {
  id: string
  name: string
  description?: string
  category?: string
  image_url?: string
  sale_price_gtq: number  // Added - Odoo list_price
  sale_price_usd: number  // Added
  cost_price_gtq: number
  cost_price_usd: number
  turnaround_days?: number
  is_active: boolean
}

export interface ClinicServicePrice {
  id: string
  clinic_id: string
  service_id: string
  service_name: string
  service_description?: string
  service_image_url?: string
  cost_price_gtq: number
  cost_price_usd: number
  sale_price_gtq: number
  sale_price_usd: number
  margin_gtq: number
  margin_usd: number
  margin_percentage?: number
  is_active: boolean
  is_available: boolean
  turnaround_days?: number
}

/**
 * Get all services from lab catalog (Odoo)
 */
/**
 * Get all services from lab catalog (Odoo)
 */
export async function getLabServices() {
  const supabase = await createClient()
  
  // Use RPC to get active lab services
  const { data, error } = await supabase.rpc('get_active_lab_services')

  if (error) {
    console.error('Error fetching lab services:', error.message, error.details)
    return { success: false, message: error.message }
  }

  return { success: true, data: data as Service[] }
}

/**
 * Get clinic's service prices with lab service details
 */
export async function getClinicServicePrices(clinicId: string) {
  const supabase = await createClient()
  
  try {
    // 1. Get clinic service prices using RPC
    const { data: prices, error: pricesError } = await supabase
      .rpc('get_clinic_service_prices', { p_clinic_id: clinicId })

    if (pricesError) {
      console.error('Error fetching clinic service prices:', pricesError)
      return { success: false, message: pricesError.message }
    }

    if (!prices || prices.length === 0) {
      return { success: true, data: [] }
    }

    // 2. Get service details for all service_ids
    // We already have RPC for fetching all services, let's use that one and filter
    // This is efficient enough for catalog sizes < 1000
    const { data: allServices, error: servicesError } = await supabase.rpc('get_active_lab_services')

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
      // Continue without service details
    }

    // 3. Create a map of services for quick lookup
    const servicesMap = new Map(
      (allServices as any[])?.map(s => [s.id, s]) || []
    )

    // 4. Transform data to flat structure
    const transformed = prices.map((item: any) => {
      const service = servicesMap.get(item.service_id)
      return {
        id: item.id,
        clinic_id: item.clinic_id,
        service_id: item.service_id,
        service_name: service?.name || 'Sin nombre',
        service_description: service?.description,
        service_image_url: service?.image_url,
        cost_price_gtq: item.cost_price_gtq,
        cost_price_usd: item.cost_price_usd,
        sale_price_gtq: item.sale_price_gtq,
        sale_price_usd: item.sale_price_usd,
        margin_gtq: item.margin_gtq,
        margin_usd: item.margin_usd,
        margin_percentage: item.margin_percentage,
        is_active: item.is_active,
        is_available: item.is_available,
        turnaround_days: service?.turnaround_days
      }
    })

    return { success: true, data: transformed as ClinicServicePrice[] }
  } catch (err) {
    console.error('Unexpected error in getClinicServicePrices:', err)
    return { success: true, data: [] } // Return empty array to prevent UI crash
  }
}

/**
 * Set or update clinic service price
 */
export async function setClinicServicePrice(data: {
  clinic_id: string
  service_id: string
  cost_price_gtq: number
  cost_price_usd: number
  sale_price_gtq: number
  sale_price_usd: number
  is_available?: boolean
}) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, message: 'Usuario no autenticado' }
  }

  // Calculate margin percentage
  const marginPercentage = data.cost_price_gtq > 0 
    ? ((data.sale_price_gtq - data.cost_price_gtq) / data.cost_price_gtq) * 100
    : 0

  const payload = {
    clinic_id: data.clinic_id,
    service_id: data.service_id,
    cost_price_gtq: data.cost_price_gtq,
    cost_price_usd: data.cost_price_usd,
    sale_price_gtq: data.sale_price_gtq,
    sale_price_usd: data.sale_price_usd,
    margin_percentage: marginPercentage,
    is_available: data.is_available ?? true,
    updated_by: user.id
  }

  // Upsert (insert or update)
  const { data: result, error } = await supabase
    .from('clinic_service_prices')
    .upsert(payload, {
      onConflict: 'clinic_id,service_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error setting clinic service price:', error)
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard/medical/services')
  return { success: true, data: result }
}

/**
 * Toggle service availability for clinic
 */
export async function toggleServiceAvailability(priceId: string, isAvailable: boolean) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, message: 'Usuario no autenticado' }
  }

  const { error } = await supabase
    .from('clinic_service_prices')
    .update({ 
      is_available: isAvailable,
      updated_by: user.id
    })
    .eq('id', priceId)

  if (error) {
    console.error('Error toggling service availability:', error)
    return { success: false, message: error.message }
  }

  revalidatePath('/dashboard/medical/services')
  return { success: true }
}

/**
 * Get available services for a clinic (for use in budgets/orders)
 */
export async function getAvailableServicesForClinic(clinicId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clinic_service_prices')
    .select(`
      *,
      service:service_id (
        name,
        description,
        image_url,
        category
      )
    `)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .eq('is_available', true)
    .order('service(name)')

  if (error) {
    console.error('Error fetching available services:', error)
    return { success: false, message: error.message }
  }


  return { success: true, data: data || [] }
}

/**
 * Create a new custom service and assign price to clinic
 */
export async function createCustomService(data: {
  clinic_id: string
  name: string
  description?: string
  cost_price_gtq: number
  cost_price_usd?: number
  sale_price_gtq: number
  sale_price_usd?: number
}) {
  const supabase = await createClient()

  // 1. Create service in global catalog (public.services)
  // Note: Ideally we should check for duplicates or have clinic_id in services table for private services.
  // For now, we insert into global services.
  // Generate code
  const code = (data.name.toUpperCase().replace(/[^A-Z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000)).substring(0, 50)

  // 1. Create service in global catalog (public.services)
  const { data: newService, error: serviceError } = await supabase
    .from('services')
    .insert({
      name: data.name,
      code: code,
      category: 'general',
      description: data.description,
      cost_price_gtq: data.cost_price_gtq,
      cost_price_usd: data.cost_price_usd || 0,
      is_active: true
    })
    .select('id')
    .single()

  if (serviceError) {
    console.error('Error creating global service:', serviceError)
    return { success: false, message: serviceError.message }
  }

  // 2. Set price for this clinic
  const { data: priceResult, error: priceError } = await supabase
    .from('clinic_service_prices')
    .insert({
        clinic_id: data.clinic_id,
        service_id: newService.id,
        cost_price_gtq: data.cost_price_gtq,
        cost_price_usd: data.cost_price_usd || 0,
        sale_price_gtq: data.sale_price_gtq,
        sale_price_usd: data.sale_price_usd || 0,
        margin_percentage: (data.cost_price_gtq > 0) 
            ? ((data.sale_price_gtq - data.cost_price_gtq) / data.cost_price_gtq) * 100 
            : 0,
        is_available: true,
        is_active: true
    })
    .select()
    .single()

    if (priceError) {
        console.error('Error setting clinic price:', priceError)
        // Rollback service creation? (Not easy without transaction, but low risk for now)
        return { success: false, message: 'Servicio creado pero falló la asignación de precio.' }
    }

  revalidatePath('/dashboard/medical/services')
  return { success: true, data: newService }
}

/**
 * Update global service and clinic price
 */
export async function updateService(data: {
  id: string
  clinic_id: string
  name: string
  description?: string
  cost_price_gtq: number
  sale_price_gtq: number
  is_active: boolean
}) {
  const supabase = await createClient()

  // 1. Update global service details
  const { error: serviceError } = await supabase
    .from('services')
    .update({
      name: data.name,
      description: data.description,
      is_active: data.is_active
    })
    .eq('id', data.id)

  if (serviceError) {
    console.error('Error updating service:', serviceError)
    return { success: false, message: serviceError.message }
  }

  // 2. Update clinic price
  // Calculate margin
  const marginPercentage = data.cost_price_gtq > 0 
    ? ((data.sale_price_gtq - data.cost_price_gtq) / data.cost_price_gtq) * 100
    : 0

  const { error: priceError } = await supabase
    .from('clinic_service_prices')
    .upsert({
        clinic_id: data.clinic_id,
        service_id: data.id,
        cost_price_gtq: data.cost_price_gtq,
        sale_price_gtq: data.sale_price_gtq,
        margin_percentage: marginPercentage,
        is_active: data.is_active,
        updated_by: (await supabase.auth.getUser()).data.user?.id
    }, {
        onConflict: 'clinic_id,service_id'
    })

  if (priceError) {
      console.error('Error updating price:', priceError)
      // Non-blocking, but good to know
  }

  revalidatePath('/dashboard/medical/services')
  return { success: true }
}

/**
 * Soft delete service (set is_active = false)
 */
export async function deleteService(serviceId: string, clinicId: string) {
    const supabase = await createClient()

    // 1. Deactivate in global services
    const { error: serviceError } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId)

    if (serviceError) {
        return { success: false, message: serviceError.message }
    }

    // 2. Deactivate in prices
    await supabase
        .from('clinic_service_prices')
        .update({ is_active: false })
        .eq('clinic_id', clinicId)
        .eq('service_id', serviceId)

    revalidatePath('/dashboard/medical/services')
    return { success: true }
}
