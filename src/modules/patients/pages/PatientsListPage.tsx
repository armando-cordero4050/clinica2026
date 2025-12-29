import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DFPage } from "@/shared/ui/DFPage";
import { DFSectionHeader } from "@/shared/ui/DFSectionHeader";
import { PatientsTable } from "../components/PatientsTable";
import { PatientDialog } from "../components/PatientDialog";
import { usePatients } from "../hooks/usePatients";
import { usePermission } from "@/shared/permissions/usePermission";
import { DFEmptyState } from "@/shared/ui/DFEmptyState";
import { Users } from "lucide-react";

export default function PatientsListPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const canView = usePermission('patients.view');
    const canCreate = usePermission('patients.create');

    const { data: patients = [], isLoading } = usePatients(searchTerm);

    if (!canView) {
        return (
            <DFPage>
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <h2 className="text-xl font-bold text-destructive">Acceso Denegado</h2>
                    <p className="text-muted-foreground">No tienes permisos para ver este módulo.</p>
                </div>
            </DFPage>
        );
    }

    return (
        <DFPage>
            <DFSectionHeader
                title="Pacientes"
                description="Gestión de expediente de pacientes."
                actions={
                    canCreate && (
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
                        </Button>
                    )
                }
            />

            <div className="flex items-center space-x-2 w-full md:w-1/3">
                <Input
                    placeholder="Buscar por nombre, email o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <PatientsTable data={patients} isLoading={isLoading} />

            {!isLoading && patients.length === 0 && !searchTerm && (
                <DFEmptyState
                    icon={Users}
                    title="No hay pacientes"
                    description="Comienza creando tu primer paciente en la plataforma."
                    action={
                        canCreate && (
                            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Crear Paciente
                            </Button>
                        )
                    }
                />
            )}

            <PatientDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                patientToEdit={null}
            />
        </DFPage>
    );
}
