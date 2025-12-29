import { supabase } from "@/shared/lib/supabase";
import { Database } from "@/shared/api/supabase-types";

// Type definitions relative to the DB schema
export type Patient = Database['public']['Tables']['patients']['Row'];
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export const patientsApi = {
    // GET List (with partial search)
    list: async (clinicId: string, search?: string) => {
        let query = supabase
            .from('patients')
            .select('*')
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: false });

        if (search) {
            // Basic search on name/email/dni
            // For more complex search, we might use a dedicated RPC or vector search later
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,dni_nit.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // GET Single
    getById: async (id: string) => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // CREATE
    create: async (patient: PatientInsert) => {
        const { data, error } = await supabase
            .from('patients')
            .insert(patient)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // UPDATE
    update: async ({ id, ...patient }: PatientUpdate & { id: string }) => {
        const { data, error } = await supabase
            .from('patients')
            .update(patient)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // DELETE
    delete: async (id: string) => {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
