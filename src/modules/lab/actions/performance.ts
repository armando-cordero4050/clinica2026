'use server'

import { createClient } from '@/lib/supabase/server'

export interface UserPerformance {
  user_id: string
  user_email: string
  stage: string
  total_orders: number
  avg_time_hours: number
  target_hours: number
  performance_pct: number
}

export async function getUserPerformanceData(userId?: string): Promise<UserPerformance[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_user_stage_performance', {
    p_user_id: userId || null
  })

  if (error) {
    console.error('Error fetching user performance:', error)
    return []
  }

  return data || []
}

export async function getLabUsers() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_lab_users')

  if (error) {
    console.error('Error fetching lab users:', error)
    return []
  }

  return data || []
}
