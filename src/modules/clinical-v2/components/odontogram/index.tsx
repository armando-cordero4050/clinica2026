// ============================================================================
// CLINICAL V2 - ODONTOGRAM MAIN COMPONENT
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToothChart } from './tooth-chart';
import { FindingDialog } from './finding-dialog';
import { FindingsPanel } from './findings-panel';
import { useDentalSession } from '../../hooks/use-dental-session';
import { ToothNumber, ToothSurface } from '../../types';
import { saveFinding } from '../../actions/findings';
import { toast } from 'sonner';
import { FINDINGS_CATALOG, getFindingById } from '../../constants/dental';
import { FileText, Info } from 'lucide-react';

interface OdontogramProps {
  patientId: string;
  patientName: string;
  onOpenLabWizard?: () => void;
}

export function Odontogram({ patientId, patientName, onOpenLabWizard }: OdontogramProps) {
  const { 
    initSession, 
    addFinding, 
    selectedTooth, 
    selectedSurface,
    selectTooth,
    findings,
  } = useDentalSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedToothForDialog, setSelectedToothForDialog] = useState<ToothNumber | null>(null);
  const [selectedSurfaceForDialog, setSelectedSurfaceForDialog] = useState<ToothSurface | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar sesión al montar
  React.useEffect(() => {
    initSession(patientId, patientName);
  }, [patientId, patientName, initSession]);

  const handleToothClick = (tooth: ToothNumber, surface: ToothSurface) => {
    setSelectedToothForDialog(tooth);
    setSelectedSurfaceForDialog(surface);
    selectTooth(tooth, surface);
    setDialogOpen(true);
  };

  const handleSaveFinding = async (findingId: string, notes?: string) => {
    if (!selectedToothForDialog || !selectedSurfaceForDialog) return;

    setIsSaving(true);
    try {
      // Guardar en BD
      const result = await saveFinding({
        patientId,
        toothNumber: selectedToothForDialog,
        surface: selectedSurfaceForDialog,
        findingId,
        notes,
      });

      if (result.success) {
        // Agregar al store local
        addFinding({
          toothNumber: selectedToothForDialog,
          surface: selectedSurfaceForDialog,
          findingId,
          notes,
        });

        const definition = getFindingById(findingId);
        toast.success(`Hallazgo registrado: ${definition?.name}`);
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error: any) {
      toast.error(`Error inesperado: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLabOrder = () => {
    if (onOpenLabWizard) {
      onOpenLabWizard();
    } else {
      toast.info('Wizard de laboratorio no configurado');
    }
  };

  const labPendingCount = findings.filter(f => {
    const def = getFindingById(f.findingId);
    return def?.requiresLabOrder && !f.labOrderId;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header con info del paciente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Odontograma - {patientName}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Sistema FDI de Numeración Dental</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {findings.length} hallazgos registrados
            </Badge>
            {labPendingCount > 0 && (
              <Badge variant="secondary" className="text-sm bg-purple-100 text-purple-800">
                {labPendingCount} pendientes de laboratorio
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Odontograma interactivo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Odontograma Interactivo</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <span>Haz clic en las superficies para registrar hallazgos</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ToothChart onToothClick={handleToothClick} />
        </CardContent>
      </Card>

      {/* Leyenda de colores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Leyenda de Hallazgos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {FINDINGS_CATALOG.slice(0, 12).map((finding) => (
              <div key={finding.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border flex-shrink-0"
                  style={{ backgroundColor: finding.color }}
                />
                <span className="text-sm truncate">{finding.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <FileText className="h-3 w-3 inline mr-1" />
            Total de {FINDINGS_CATALOG.length} tipos de hallazgos disponibles
          </div>
        </CardContent>
      </Card>

      {/* Panel de hallazgos registrados */}
      <FindingsPanel onCreateLabOrder={handleCreateLabOrder} />

      {/* Dialog para agregar hallazgos */}
      {selectedToothForDialog && selectedSurfaceForDialog && (
        <FindingDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedToothForDialog(null);
            setSelectedSurfaceForDialog(null);
          }}
          toothNumber={selectedToothForDialog}
          surface={selectedSurfaceForDialog}
          onSave={handleSaveFinding}
        />
      )}
    </div>
  );
}
