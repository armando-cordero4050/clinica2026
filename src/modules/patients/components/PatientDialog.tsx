import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { PatientForm } from "./PatientForm";
import { Patient } from "../api/patients.api";
import { useCreatePatient, useUpdatePatient } from "../hooks/usePatients";

interface PatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientToEdit?: Patient | null;
}

export function PatientDialog({ open, onOpenChange, patientToEdit }: PatientDialogProps) {
    const createMutation = useCreatePatient();
    const updateMutation = useUpdatePatient();

    const isEditing = !!patientToEdit;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = async (values: any) => { // Type inference handled by Form
        if (isEditing && patientToEdit) {
            await updateMutation.mutateAsync({ id: patientToEdit.id, ...values });
        } else {
            await createMutation.mutateAsync(values);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Paciente" : "Nuevo Paciente"}</DialogTitle>
                </DialogHeader>
                <PatientForm
                    initialData={patientToEdit || undefined}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
