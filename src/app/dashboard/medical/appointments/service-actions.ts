'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createServiceDebug(data: {
  name: string
  description?: string
  price?: number
}) {
  console.log('[CreateServiceDebug] Iniciando...', data)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('[CreateServiceDebug] No user')
      return { success: false, message: 'No autenticado' }
    }

    // 1. Get Clinic
    const { data: profile } = await supabase
        .from('clinic_staff')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single()
    
    if (!profile?.clinic_id) {
        console.error('[CreateServiceDebug] No clinic')
        return { success: false, message: 'Sin clínica' }
    }

    // Generate a code from name + random suffix
    const code = (data.name.toUpperCase().replace(/[^A-Z0-9]/g, '-') + '-' + Math.floor(Math.random() * 10000)).substring(0, 50)

    // 2. Create Public Service
    const { data: newService, error: serviceError } = await supabase
        .from('services')
        .insert({
            name: data.name,
            code: code,
            category: 'general',
            description: data.description,
            is_active: true
        })
        .select()
        .single()
    
    if (serviceError) {
        console.error('[CreateServiceDebug] Service Error:', serviceError)
        return { success: false, message: serviceError.message }
    }
    
    console.log('[CreateServiceDebug] Service Created:', newService.id)

    // 3. Create Price
    if (data.price) {
        const { error: priceError } = await supabase
            .from('clinic_service_prices')
            .insert({
                clinic_id: profile.clinic_id,
                service_id: newService.id,
                sale_price_gtq: data.price,
                cost_price_gtq: 0,
                sale_price_usd: 0,
                cost_price_usd: 0,
                is_available: true,
                is_active: true
            })
        
        if (priceError) {
            console.error('[CreateServiceDebug] Price Error:', priceError)
        }
    }

    revalidatePath('/dashboard/medical/appointments')
    return { success: true, id: newService.id, name: newService.name }

  } catch (err) {
    console.error('[CreateServiceDebug] CRITICAL EXCEPTION:', err)
    return { success: false, message: 'Excepción del servidor: ' + String(err) }
  }
}
