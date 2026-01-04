'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PendingPickup {
    order_id: string
    order_number: string
    clinic_id: string
    clinic_name: string
    clinic_address: string
    patient_name: string
    service_name: string
    due_date: string
    priority: string
    created_at: string
}

export async function getPendingPickups(): Promise<PendingPickup[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('get_pending_pickups')
    
    if (error) {
        console.error('Error fetching pending pickups:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        return []
    }
    
    return data || []
}

export async function assignOrderToCourier(
    orderId: string,
    courierId: string,
    assignmentType: 'pickup' | 'delivery'
) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('assign_order_to_courier', {
        p_order_id: orderId,
        p_courier_id: courierId,
        p_assignment_type: assignmentType
    })
    
    if (error) {
        console.error('Error assigning order:', error)
        return { success: false, message: error.message }
    }
    
    revalidatePath('/dashboard/logistics')
    revalidatePath('/dashboard/lab')
    
    return data
}

export async function getCourierOrders(courierId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase.rpc('get_courier_orders', {
        p_courier_id: courierId
    })
    
    if (error) {
        console.error('Error fetching courier orders:', error)
        return []
    }
    
    return data || []
}
