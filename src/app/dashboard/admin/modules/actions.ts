'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleModuleAction(moduleId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase.rpc('update_module_status', {
    p_module_id: moduleId,
    p_is_active: isActive
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/admin/modules')
  return { success: true }
}
