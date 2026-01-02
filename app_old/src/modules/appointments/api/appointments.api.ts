import { supabase } from '@/shared/lib/supabase';
import { Database } from '@/shared/api/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type NewAppointment = Database['public']['Tables']['appointments']['Insert'];

export const AppointmentsAPI = {
    getAppointments: async (startRange: Date, endRange: Date) => {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patients(first_name, last_name),
                doctor:profiles(full_name)
            `)
            .gte('start_time', startRange.toISOString())
            .lte('end_time', endRange.toISOString())
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data;
    },

    createAppointment: async (appointment: Omit<NewAppointment, 'id' | 'created_at' | 'updated_at'>) => {
        const { data, error } = await supabase
            .from('appointments')
            .insert(appointment)
            .select() // Returning *
            .single();

        if (error) throw error;
        return data;
    },

    updateStatus: async (id: string, status: Appointment['status']) => {
        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
    
    deleteAppointment: async (id: string) => {
         const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', id);
            
         if (error) throw error;
         return true;
    }
};
