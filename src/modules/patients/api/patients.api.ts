import { supabase } from '@/shared/lib/supabase';
import { PatientFormValues } from '../schemas/patient.schema';

export const patientsApi = {
    getPatients: async (clinicId: string) => {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    createPatient: async (patient: PatientFormValues, clinicId: string) => {
        const { data, error } = await supabase
            .from('patients')
            .insert({
                ...patient,
                clinic_id: clinicId,
                // Handle optional dates: empty string should be null for DB or handled by Zod
                birth_date: patient.birth_date === '' ? null : patient.birth_date
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updatePatient: async (id: string, patient: PatientFormValues) => {
        const { data, error } = await supabase
            .from('patients')
            .update({
                ...patient,
                birth_date: patient.birth_date === '' ? null : patient.birth_date
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deletePatient: async (id: string) => {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
