'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'


export interface KanbanCard {
  id: string
  clinic_name: string
  product_name: string
  patient_summary: string
  status: string
  priority: 'normal' | 'high' | 'urgent'
  due_date: string
  total_price: number
  currency: string
  odoo_status: 'pending' | 'synced' | 'error'
  doctor_name?: string
  order_number?: string
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
  new: number
  in_process: number
  pending: number
  on_hold: number
  rejected: number
  delivered: number
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
    return []
  }

  return data as KanbanCard[]
}

export async function updateCardStatus(orderId: string, newStatus: string, justification?: string) {
  const supabase = await createClient()

  // Use RPC to bypass schema visibility issues
  const { error } = await supabase.rpc('update_lab_order_status', {
    p_order_id: orderId,
    p_status: newStatus,
    p_justification: justification
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/lab')
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
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_lab_dashboard_stats')
  
  if (error) {
    console.error('Error fetching dashboard stats:', error)
    return { new: 0, in_process: 0, pending: 0, on_hold: 0, rejected: 0, delivered: 0, avg_sla_pct: 0 }
  }
  
  return data as LabDashboardStats
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
