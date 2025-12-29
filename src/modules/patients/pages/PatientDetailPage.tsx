import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DFPage } from "@/shared/ui/DFPage";
import { DFSectionHeader } from "@/shared/ui/DFSectionHeader";
import { DFCard, DFCardContent, DFCardHeader, DFCardTitle } from "@/shared/ui/DFCard";
import { usePatient } from "../hooks/usePatients";
import { usePermission } from "@/shared/permissions/usePermission";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PatientDialog } from "../components/PatientDialog";
import { useState } from "react";

export default function PatientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const canView = usePermission('patients.view');
    const canEdit = usePermission('patients.edit');

    const { data: patient, isLoading } = usePatient(id || '');

    if (!canView) {
        return <div>Acceso Denegado</div>;
    }

    if (isLoading) {
        return (
            <DFPage>
                <Skeleton className="h-12 w-1/3 mb-6" />
                <div className="grid grid-cols-3 gap-6">
                    <Skeleton className="h-64 col-span-1" />
                    <Skeleton className="h-64 col-span-2" />
                </div>
            </DFPage>
        );
    }

    if (!patient) return <div>Paciente no encontrado</div>;

    return (
        <DFPage>
            <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate('/patients')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a lista
            </Button>

            <DFSectionHeader
                title={`${patient.first_name} ${patient.last_name}`}
                description={`ID: ${patient.dni_nit || 'N/A'}`}
                actions={
                    canEdit && (
                        <Button onClick={() => setIsEditOpen(true)}>Editar Paciente</Button>
                    )
                }
            />

            <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                    <TabsTrigger value="contact">Contacto</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DFCard>
                            <DFCardHeader>
                                <DFCardTitle className="flex items-center gap-2">
                                    <User className="h-4 w-4" /> Datos Personales
                                </DFCardTitle>
                            </DFCardHeader>
                            <DFCardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    <span className="text-muted-foreground">Género:</span>
                                    <span>{patient.gender || '-'}</span>
                                    <span className="text-muted-foreground">Nacimiento:</span>
                                    <span>{patient.date_of_birth || '-'}</span>
                                    <span className="text-muted-foreground">Moneda:</span>
                                    <span>{patient.currency_code}</span>
                                </div>
                            </DFCardContent>
                        </DFCard>

                        <DFCard className="md:col-span-2">
                            <DFCardHeader>
                                <DFCardTitle>Notas Recientes</DFCardTitle>
                            </DFCardHeader>
                            <DFCardContent>
                                <p className="text-muted-foreground text-sm">Próximamente: Historial clínico y notas.</p>
                            </DFCardContent>
                        </DFCard>
                    </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-6">
                    <DFCard>
                        <DFCardHeader>
                            <DFCardTitle className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Información de Contacto
                            </DFCardTitle>
                        </DFCardHeader>
                        <DFCardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Email</span>
                                    <span>{patient.email || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Teléfono</span>
                                    <span>{patient.phone || '-'}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-muted-foreground block">Dirección</span>
                                    {/* Rough render of JSON address */}
                                    <span>{(patient.address as any)?.line1 || ''} {(patient.address as any)?.city || ''}</span>
                                </div>
                            </div>
                        </DFCardContent>
                    </DFCard>
                </TabsContent>

                <TabsContent value="history">
                    <div className="h-64 flex items-center justify-center border border-dashed rounded-lg bg-muted/10">
                        <span className="text-muted-foreground">Próximamente: Historial de tratamientos y citas.</span>
                    </div>
                </TabsContent>
            </Tabs>

            <PatientDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                patientToEdit={patient}
            />
        </DFPage>
    );
}
