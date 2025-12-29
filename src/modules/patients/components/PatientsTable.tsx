import { useNavigate } from "react-router-dom";
import { Edit, Eye } from "lucide-react";
import { DFDataTable } from "@/shared/ui/DFDataTable";
import { Patient } from "@/modules/patients/api/patients.api";
import { Button } from "@/shared/components/ui/button";
import { usePermission } from "@/shared/permissions/usePermission";

interface PatientsTableProps {
    data: Patient[];
    isLoading: boolean;
}

export function PatientsTable({ data, isLoading }: PatientsTableProps) {
    const navigate = useNavigate();
    const canView = usePermission('patients.view');
    const canEdit = usePermission('patients.edit');

    const columns = [
        {
            header: "Paciente",
            cell: (p: Patient) => (
                <div className="flex flex-col">
                    <span className="font-medium">{p.first_name} {p.last_name}</span>
                    <span className="text-xs text-muted-foreground">{p.dni_nit || 'Sin ID'}</span>
                </div>
            )
        },
        {
            header: "Contacto",
            cell: (p: Patient) => (
                <div className="flex flex-col text-sm">
                    <span>{p.phone || '-'}</span>
                    <span className="text-muted-foreground">{p.email || '-'}</span>
                </div>
            )
        },
        {
            header: "Género",
            accessorKey: 'gender' as const,
            className: "w-20"
        },
        {
            header: "Moneda",
            accessorKey: 'currency_code' as const,
            className: "w-20"
        },
        {
            header: "Acciones",
            className: "w-32 text-right",
            cell: (p: Patient) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {canView && (
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${p.id}`)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                    {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${p.id}/edit`)}> {/* Actually we might plain to open a modal */}
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <DFDataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(p) => canView && navigate(`/patients/${p.id}`)}
        />
    );
}
