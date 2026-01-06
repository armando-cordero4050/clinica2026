/**
 * Clinical V2 Module - Server Actions
 * Database operations for findings and lab orders
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ToothFinding } from '../types';

// ============= FINDINGS OPERATIONS =============

/**
 * Save a tooth finding to the database
 * Uses the existing tooth_conditions table via RPC
 */
export async function saveFinding(data: {
  patientId: string;
  toothNumber: number;
  surface: string;
  condition: string;
  notes?: string;
  serviceId?: string;
  cost?: number;
  price?: number;
}) {
  try {
    const supabase = await createClient();

    // Use existing RPC for upserting tooth condition
    const { data: newId, error } = await supabase.rpc('upsert_tooth_condition', {
      p_patient_id: data.patientId,
      p_tooth_number: data.toothNumber,
      p_surface: data.surface,
      p_condition: data.condition,
      p_notes: data.notes || null,
    });

    if (error) {
      console.error('[saveFinding] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/clinical-v2/demo`);
    revalidatePath(`/dashboard/medical/patients/${data.patientId}`);
    
    return { success: true, id: newId };
  } catch (err: any) {
    console.error('[saveFinding] Exception:', err);
    return { success: false, error: err.message || 'Failed to save finding' };
  }
}

/**
 * Get patient findings from database
 * Uses existing RPC to get dental chart
 */
export async function getPatientFindings(patientId: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_patient_dental_chart', {
      p_patient_id: patientId,
    });

    if (error) {
      console.error('[getPatientFindings] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('[getPatientFindings] Exception:', err);
    return { success: false, error: err.message || 'Failed to fetch findings' };
  }
}

/**
 * Delete a finding
 */
export async function deleteFinding(findingId: string, patientId: string) {
  try {
    const supabase = await createClient();

    // Delete from tooth_conditions table
    const { error } = await supabase
      .from('tooth_conditions')
      .delete()
      .eq('id', findingId);

    if (error) {
      console.error('[deleteFinding] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/clinical-v2/demo`);
    revalidatePath(`/dashboard/medical/patients/${patientId}`);
    
    return { success: true };
  } catch (err: any) {
    console.error('[deleteFinding] Exception:', err);
    return { success: false, error: err.message || 'Failed to delete finding' };
  }
}

// ============= LAB ORDER OPERATIONS =============

/**
 * Create a lab order with items
 * Uses the existing create_lab_order_transaction_v2 RPC
 */
export async function createLabOrderV2(orderData: {
  patientId: string;
  doctorId?: string;
  priority: 'urgent' | 'normal' | 'low';
  targetDeliveryDate?: string;
  notes?: string;
  items: Array<{
    configurationId: string;
    toothNumber: number;
    color: string;
    unitPrice: number;
    clinicalFindingId?: string;
  }>;
  shippingType: 'pickup' | 'courier' | 'digital';
  carrierName?: string;
  trackingNumber?: string;
  clinicLat?: number;
  clinicLng?: number;
}) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get clinic_id from clinic_staff
    const { data: staff, error: staffError } = await supabase
      .from('clinic_staff')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single();

    if (staffError || !staff) {
      return { 
        success: false, 
        error: 'User not associated with a clinic' 
      };
    }

    // Call the existing RPC for creating lab order
    const { data: orderId, error: rpcError } = await supabase.rpc(
      'create_lab_order_transaction_v2',
      {
        p_clinic_id: staff.clinic_id,
        p_patient_id: orderData.patientId,
        p_doctor_id: orderData.doctorId || user.id,
        p_priority: orderData.priority,
        p_target_date: orderData.targetDeliveryDate || null,
        p_notes: orderData.notes || null,
        p_items: orderData.items.map(item => ({
          configuration_id: item.configurationId,
          tooth_number: item.toothNumber,
          color: item.color,
          unit_price: item.unitPrice,
          clinical_finding_id: item.clinicalFindingId || null,
        })),
        p_shipping_type: orderData.shippingType,
        p_carrier_name: orderData.carrierName || null,
        p_tracking_number: orderData.trackingNumber || null,
        p_clinic_lat: orderData.clinicLat || null,
        p_clinic_lng: orderData.clinicLng || null,
      }
    );

    if (rpcError) {
      console.error('[createLabOrderV2] RPC Error:', rpcError);
      
      // Fallback to V1 if V2 doesn't exist
      if (rpcError.code === '42883') {
        console.warn('RPC v2 not found, trying v1 (logistics data will be lost)');
        
        const { data: orderIdV1, error: rpcErrorV1 } = await supabase.rpc(
          'create_lab_order_transaction',
          {
            p_clinic_id: staff.clinic_id,
            p_patient_id: orderData.patientId,
            p_doctor_id: orderData.doctorId || user.id,
            p_priority: orderData.priority,
            p_target_date: orderData.targetDeliveryDate || null,
            p_notes: orderData.notes || null,
            p_items: orderData.items.map(item => ({
              configuration_id: item.configurationId,
              tooth_number: item.toothNumber,
              color: item.color,
              unit_price: item.unitPrice,
              clinical_finding_id: item.clinicalFindingId || null,
            })),
          }
        );

        if (rpcErrorV1) {
          return { success: false, error: rpcErrorV1.message };
        }

        revalidatePath('/dashboard/lab');
        return { success: true, orderId: orderIdV1 };
      }

      return { success: false, error: rpcError.message };
    }

    revalidatePath('/dashboard/lab');
    revalidatePath('/dashboard/clinical-v2/demo');
    
    return { success: true, orderId };
  } catch (err: any) {
    console.error('[createLabOrderV2] Exception:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to create lab order' 
    };
  }
}

/**
 * Get lab catalog for material selection
 */
export async function getLabCatalogV2() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('lab_materials')
      .select(`
        id,
        name,
        slug,
        description,
        is_active,
        types:lab_material_types (
          id,
          name,
          slug,
          description,
          configurations:lab_configurations (
            id,
            name,
            slug,
            category,
            requires_units,
            base_price,
            sla_days
          )
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('[getLabCatalogV2] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[getLabCatalogV2] Exception:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to fetch lab catalog' 
    };
  }
}
