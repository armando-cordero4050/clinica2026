import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi, Patient, PatientInsert, PatientUpdate } from "../api/patients.api";
import { useSession } from "@/shared/lib/auth";
import { toast } from "sonner";

export const PATIENTS_KEYS = {
    all: ['patients'] as const,
    lists: () => [...PATIENTS_KEYS.all, 'list'] as const,
    list: (clinicId: string, search?: string) => [...PATIENTS_KEYS.lists(), clinicId, { search }] as const,
    details: () => [...PATIENTS_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...PATIENTS_KEYS.details(), id] as const,
};

export function usePatients(search?: string) {
    const { clinicId } = useSession();

    return useQuery({
        queryKey: PATIENTS_KEYS.list(clinicId || '', search),
        queryFn: () => {
            if (!clinicId) throw new Error("No active clinic");
            return patientsApi.list(clinicId, search);
        },
        enabled: !!clinicId, // Only fetch if we have a context
    });
}

export function usePatient(id: string) {
    return useQuery({
        queryKey: PATIENTS_KEYS.detail(id),
        queryFn: () => patientsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreatePatient() {
    const queryClient = useQueryClient();
    const { clinicId } = useSession();

    return useMutation({
        mutationFn: (newPatient: Omit<PatientInsert, 'clinic_id'>) => {
            if (!clinicId) throw new Error("No active clinic");
            return patientsApi.create({ ...newPatient, clinic_id: clinicId });
        },
        onSuccess: () => {
            toast.success("Paciente creado correctamente");
            queryClient.invalidateQueries({ queryKey: PATIENTS_KEYS.lists() });
        },
        onError: (error) => {
            toast.error(`Error al crear paciente: ${error.message}`);
        }
    });
}

export function useUpdatePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: PatientUpdate & { id: string }) => patientsApi.update(updates),
        onSuccess: (data: Patient) => {
            toast.success("Paciente actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: PATIENTS_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: PATIENTS_KEYS.detail(data.id) });
        },
        onError: (error) => {
            toast.error(`Error al actualizar: ${error.message}`);
        }
    });
}
