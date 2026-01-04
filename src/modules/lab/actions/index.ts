'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'


export interface KanbanCard {
  id: string
  order_number: string
  patient_name: string
  doctor_name: string
  clinic_name: string
  status: string
  service_name: string
  due_date: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  delivery_type: 'digital' | 'pickup' | 'shipping'
  created_at: string
  total_price: number
  currency: string
  odoo_status: 'pending' | 'synced' | 'error'
  patient_id?: string
  is_digital?: boolean
  courier_name?: string
  tracking_number?: string
  requirement_notes?: string
  sla_hours?: number
  is_paused?: boolean
  paused_at?: string
  timers?: {
    total_seconds: number
    is_running: boolean
    last_start: string | null
  }
}

export interface LabDashboardStats {
  clinic_pending: number
  income_validation: number
  gypsum: number
  design: number
  client_approval: number
  nesting: number
  production_man: number
  qa: number
  billing: number
  delivery: number
  avg_sla_pct: number
}

export interface ProductionChartData {
  day: string
  completed_count: number
}

export async function getKanbanCards(): Promise<KanbanCard[]> {
  const supabase = await createClient()
  
  // Use RPC to bypass potential schema visibility issues in Dashboard
  const { data, error } = await supabase.rpc('get_lab_kanban')

  if (error) {
    console.error('Error fetching kanban:', error)
    console.error('Kanban error details:', JSON.stringify(error, null, 2))
    return []
  }

  return data as KanbanCard[]
}

export async function updateCardStatus(orderId: string, newStatus: string, justification?: string) {
  try {
    console.log('🔵 updateCardStatus called:', { orderId, newStatus, justification })
    
    const supabase = await createClient()

    // Use RPC to bypass schema visibility issues
    const { error } = await supabase.rpc('update_lab_order_status', {
      p_order_id: orderId,
      p_status: newStatus,
      p_justification: justification || null
    })

    if (error) {
      console.error('🔴 RPC error:', error)
      throw new Error(error.message)
    }

    console.log('✅ Order status updated successfully')
    revalidatePath('/dashboard/lab')
    revalidatePath('/dashboard/lab/kamba')
  } catch (error: any) {
    console.error('🔴 updateCardStatus error:', error)
    throw error
  }
}

export async function toggleTimerAction(cardId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('toggle_lab_timer', {
    p_order_id: cardId
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/lab')
  return data // Returns updated timers object
}

export async function getLabDashboardStats(): Promise<LabDashboardStats> {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error in getLabDashboardStats:', authError)
      return { 
        clinic_pending: 0, 
        income_validation: 0, 
        gypsum: 0, 
        design: 0, 
        client_approval: 0, 
        nesting: 0, 
        production_man: 0, 
        qa: 0, 
        billing: 0, 
        delivery: 0, 
        avg_sla_pct: 0 
      }
    }
    
    console.log('🔵 Calling get_lab_dashboard_stats for user:', user.id)
    
    const { data, error } = await supabase.rpc('get_lab_dashboard_stats')
    
    if (error) {
      console.error('Error fetching dashboard stats:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return { 
        clinic_pending: 0, 
        digital_picking: 0, 
        income_validation: 0, 
        gypsum: 0, 
        design: 0, 
        client_approval: 0, 
        nesting: 0, 
        production_man: 0, 
        qa: 0, 
        billing: 0, 
        delivery: 0, 
        avg_sla_pct: 0 
      }
    }
    
    console.log('✅ Dashboard stats received:', data)
    return data as LabDashboardStats
  } catch (err) {
    console.error('Exception in getLabDashboardStats:', err)
    return { 
      clinic_pending: 0, 
      income_validation: 0, 
      gypsum: 0, 
      design: 0, 
      client_approval: 0, 
      nesting: 0, 
      production_man: 0, 
      qa: 0, 
      billing: 0, 
      delivery: 0, 
      avg_sla_pct: 0 
    }
  }
}

export async function getLabProductionChart(): Promise<ProductionChartData[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_lab_production_chart')
  
  if (error) {
    console.error('Error fetching chart data:', error)
    return []
  }
  
  return (data as { day: string, completed_count: number }[]).map(d => ({
     day: new Date(d.day).toLocaleDateString('es-GT', { weekday: 'short', day: 'numeric' }),
     completed_count: d.completed_count
  }))
}

export async function pauseOrder(orderId: string, reason: string) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('request_order_pause', {
    p_order_id: orderId,
    p_reason: reason
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/lab/kamba')
}

export async function getGlobalKamba(): Promise<KanbanCard[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_global_kamba')
  
  if (error) {
    console.error('Error fetching global kamba:', error)
    return []
  }
  
  return data as KanbanCard[]
}
