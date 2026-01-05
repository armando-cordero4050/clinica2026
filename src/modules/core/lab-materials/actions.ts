'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================================================
// TYPES
// ============================================================================

export interface LabMaterial {
  id?: string
  name: string
  description?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface LabConfiguration {
  id?: string
  material_id: string
  name: string
  code?: string
  odoo_product_id?: string
  base_price: number
  price_type?: 'fixed' | 'per_unit'
  sla_days: number
  is_express_allowed?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface LabMaterialWithCount extends LabMaterial {
  config_count: number
}

// ============================================================================
// LAB MATERIALS CRUD
// ============================================================================

export async function getLabMaterials() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lab_materials')
    .select(`
      *,
      lab_configurations(count)
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching lab materials:', error)
    return { success: false, error: error.message, data: null }
  }

  // Transform data to include config count
  const materials = data.map(m => ({
    ...m,
    config_count: m.lab_configurations?.[0]?.count || 0
  }))

  return { success: true, data: materials, error: null }
}

export async function createLabMaterial(material: LabMaterial) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lab_materials')
    .insert({
      name: material.name,
      description: material.description,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating lab material:', error)
    return { success: false, error: error.message, data: null }
  }

  revalidatePath('/core/lab-materials')
  return { success: true, data, error: null }
}

export async function updateLabMaterial(id: string, material: Partial<LabMaterial>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lab_materials')
    .update({
      name: material.name,
      description: material.description,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating lab material:', error)
    return { success: false, error: error.message, data: null }
  }

  revalidatePath('/core/lab-materials')
  return { success: true, data, error: null }
}

export async function deleteLabMaterial(id: string) {
  const supabase = await createClient()
  
  // Soft delete
  const { data, error } = await supabase
    .from('lab_materials')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error deleting lab material:', error)
    return { success: false, error: error.message, data: null }
  }

  revalidatePath('/core/lab-materials')
  return { success: true, data, error: null }
}

// ============================================================================
// LAB CONFIGURATIONS CRUD
// ============================================================================

export async function getLabConfigurations(materialId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('lab_configurations')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (materialId) {
    query = query.eq('material_id', materialId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching lab configurations:', error)
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data, error: null }
}

export async function createLabConfiguration(config: LabConfiguration) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lab_configurations')
    .insert({
      material_id: config.material_id,
      name: config.name,
      code: config.code,
      odoo_product_id: config.odoo_product_id,
      base_price: config.base_price,
      price_type: config.price_type || 'per_unit',
      sla_days: config.sla_days,
      is_express_allowed: config.is_express_allowed ?? true,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating lab configuration:', error)
    return { success: false, error: error.message, data: null }
  }

  revalidatePath('/core/lab-materials')
  return { success: true, data, error: null }
}

export async function updateLabConfiguration(id: string, config: Partial<LabConfiguration>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lab_configurations')
    .update({
      name: config.name,
      code: config.code,
      odoo_product_id: config.odoo_product_id,
      base_price: config.base_price,
      price_type: config.price_type,
      sla_days: config.sla_days,
      is_express_allowed: config.is_express_allowed,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating lab configuration:', error)
    return { success: false, error: error.message, data: null }
  }

  revalidatePath('/core/lab-materials')
  return { success: true, data, error: null }
}

export async function deleteLabConfiguration(id: string) {
  const supabase = await createClient()
  
  // Soft delete
  const { data, error } = await supabase
    .from('lab_configurations')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error deleting lab configuration:', error)
    return { success: false, error: error.message, data: null }
  }

  revalidatePath('/core/lab-materials')
  return { success: true, data, error: null }
}
