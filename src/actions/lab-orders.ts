
'use server';

import { createClient } from '@/lib/supabase/server'; // Corrected path
import { LabCatalog, LabMaterial } from '@/types/lab';
import { labOrderFormSchema } from '@/lib/validations/lab';

/**
 * Fetches the full hierarchical lab catalog.
 * Structure: Materials -> Types -> Configurations
 */
export async function getLabCatalog(): Promise<{ data: LabCatalog | null; error: string | null }> {
  const supabase = await createClient();

  try {
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
      console.error('Error fetching lab catalog:', error);
      return { data: null, error: 'Failed to load laboratory catalog.' };
    }
    
    return { 
      data: { materials: data as unknown as LabMaterial[] }, 
      error: null 
    };

  } catch (err) {
    console.error('Unexpected error in getLabCatalog:', err);
    return { data: null, error: 'Internal server error.' };
  }
}

/**
 * Creates a new Lab Order with items.
 */
export async function createLabOrder(orderData: unknown): Promise<{ orderId: string | null; error: string | null }> {
    const supabase = await createClient();
    
    // 1. Validate Input
    const parsed = labOrderFormSchema.safeParse(orderData);
    if (!parsed.success) {
        return { orderId: null, error: parsed.error.errors[0].message };
    }
    
    const { patient_id, doctor_id, priority, target_delivery_date, notes, items } = parsed.data;

    try {
        // 2. Get Clinic ID (Securely from User Session)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        // We need to determine the clinic_id. 
        let clinic_id: string | undefined;

        // Fetch clinic_id from clinic_staff view/table
        const { data: staff } = await supabase.from('clinic_staff').select('clinic_id').eq('user_id', user.id).single();
         if (staff) {
             clinic_id = staff.clinic_id;
         } else {
             // Fallback or Error
             return { orderId: null, error: 'User is not associated with a clinic.' };
         }

        // 3. Call Transactional RPC
        const { data: orderId, error: rpcError } = await supabase.rpc('create_lab_order_transaction', {
            p_clinic_id: clinic_id,
            p_patient_id: patient_id,
            p_doctor_id: doctor_id,
            p_priority: priority,
            p_target_date: target_delivery_date,
            p_notes: notes,
            p_items: items.map(item => ({
                configuration_id: item.configuration_id,
                tooth_number: item.tooth_number,
                color: item.color,
                unit_price: item.unit_price,
                clinical_finding_id: item.clinical_finding_id
            }))
        });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            throw new Error(rpcError.message);
        }

        return { orderId: orderId, error: null };

    } catch (err: any) {
        console.error('Create Order Error:', err);
        return { orderId: null, error: err.message || 'Failed to create lab order.' };
    }
}
