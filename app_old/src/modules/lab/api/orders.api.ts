import { supabase } from '@/shared/lib/supabase';
import { OrderFormValues } from '../schemas/order.schema';

export const ordersApi = {
    // Fetch active services for the dropdown
    getServices: async () => {
        const { data, error } = await supabase
            .from('lab_services')
            .select('*')
            .eq('is_active', true)
            .order('name');
        if (error) throw error;
        return data;
    },

    // Fetch orders for Kanban (or list)
    getOrders: async (_clinicId: string) => {
        // Need to join with patients and profiles to show names
        const { data, error } = await supabase
            .from('lab_orders')
            .select(`
                *,
                patient:patients(first_name, last_name),
                doctor:profiles(full_name),
                items:lab_order_items(*)
            `)
            // RLS handles visibility (Lab sees all, Clinic sees theirs)
            // But strict filtering by clinic_id is good for performance if user is clinic_admin
            // However, Lab Admin needs to see ALL clinics.
            // So we rely on RLS and don't force .eq('clinic_id') unless we are sure.
            // Actually, for the "Lab Board" we want ALL orders.
            // For "My Clinic Orders" we want clinic specific.
            // Let's rely on RLS for safety. 
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    createOrder: async (order: OrderFormValues, clinicId: string) => {
        // 1. Insert Order
        const { data: orderData, error: orderError } = await supabase
            .from('lab_orders')
            .insert({
                clinic_id: clinicId,
                patient_id: order.patient_id,
                doctor_id: order.doctor_id,
                priority: order.priority,
                delivery_due_date: order.delivery_due_date,
                shipping_address: order.shipping_address,
                status: 'submitted'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Insert Items
        const itemsToInsert = order.items.map(item => ({
            order_id: orderData.id,
            service_id: item.service_id,
            tooth_number: item.tooth_number,
            notes: item.notes,
            price: item.price
        }));

        const { error: itemsError } = await supabase
            .from('lab_order_items')
            .insert(itemsToInsert);

        if (itemsError) {
            // Rollback order? Supabase API doesn't support easy rollback of previous request unless RPC.
            // For now, we accept risk or would use an RPC function for atomicity.
            // Ideally: Create an RPC 'create_full_order'.
            // For PR #5, we proceed with client-side chaining, but knowing it's not atomic.
            console.error('Error inserting items, order might be incomplete', itemsError);
            throw itemsError;
        }

        return orderData;
    },

    updateStatus: async (orderId: string, status: string) => {
        const { data, error } = await supabase
            .from('lab_orders')
            .update({ status: status as any })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
