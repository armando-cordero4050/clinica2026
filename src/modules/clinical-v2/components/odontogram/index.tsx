/**
 * Clinical V2 - Main Odontogram Component
 * Integrates tooth chart, finding dialog, and findings panel
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ToothChart } from './tooth-chart';
import { FindingDialog } from './finding-dialog';
import { FindingsPanel } from './findings-panel';
import { LabWizardV2 } from '../lab-wizard';
import { useDentalSession } from '../../hooks/use-dental-session';
import { OdontogramV2Props, ToothNumber, ToothSurface, ToothFinding } from '../../types';
import { saveFinding, getPatientFindings, deleteFinding } from '../../actions';

export function OdontogramV2({
  patientId,
  patientName,
  readonly = false,
  initialDentition = 'adult',
}: OdontogramV2Props) {
  const {
    patient,
    isChildDentition,
    findings,
    selectedTooth,
    selectedSurface,
    wizardOpen,
    initSession,
    setIsChildDentition,
    addFinding,
    loadFindings,
    selectTooth,
    removeFinding,
    openWizard,
  } = useDentalSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    const [firstName, ...lastNameParts] = patientName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    initSession(
      {
        id: patientId,
        firstName: firstName || patientName,
        lastName: lastName || '',
      },
      initialDentition === 'child'
    );

    // Load existing findings
    loadPatientFindings();
  }, [patientId, patientName, initialDentition]);

  // Load findings from database
  const loadPatientFindings = async () => {
    setIsLoading(true);
    try {
      const result = await getPatientFindings(patientId);
      if (result.success && result.data) {
        // Transform database findings to ToothFinding format
        const transformedFindings: ToothFinding[] = result.data.map((f: any) => ({
          id: f.id || crypto.randomUUID(),
          patientId: patientId,
          toothNumber: f.tooth_number,
          surface: f.surface,
          findingId: f.condition,
          findingName: f.condition,
          category: determineCategory(f.condition),
          color: determineColor(f.condition),
          status: 'pending',
          notes: f.notes,
          labOrderId: f.lab_order_id,
          createdAt: f.updated_at || new Date().toISOString(),
          updatedAt: f.updated_at || new Date().toISOString(),
        }));
        loadFindings(transformedFindings);
      }
    } catch (error) {
      console.error('Error loading findings:', error);
      toast.error('Error al cargar hallazgos');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine category from condition string
  const determineCategory = (condition: string): 'clinical' | 'lab' | 'existing' => {
    const labConditions = ['corona', 'carilla', 'puente', 'incrustacion', 'perno', 
                           'protesis_total', 'protesis_removible', 'guarda', 'retenedor', 'implante'];
    if (labConditions.includes(condition.toLowerCase())) return 'lab';
    if (['amalgam', 'composite'].includes(condition.toLowerCase())) return 'existing';
    return 'clinical';
  };

  // Helper to determine color from condition string
  const determineColor = (condition: string): string => {
    const colorMap: Record<string, string> = {
      healthy: '#ffffff',
      caries: '#ef4444',
      amalgam: '#6b7280',
      composite: '#93c5fd',
      endodoncia: '#f97316',
      extraccion: '#dc2626',
      ausente: '#9ca3af',
      corona: '#eab308',
      carilla: '#facc15',
      puente: '#ca8a04',
      incrustacion: '#d97706',
      perno: '#78350f',
      protesis_total: '#8b5cf6',
      protesis_removible: '#a78bfa',
      guarda: '#10b981',
      retenedor: '#0ea5e9',
      implante: '#3b82f6',
    };
    return colorMap[condition.toLowerCase()] || '#ffffff';
  };

  // Handle tooth surface click
  const handleToothClick = (tooth: ToothNumber, surface: ToothSurface) => {
    if (readonly) return;
    selectTooth(tooth, surface);
    setDialogOpen(true);
  };

  // Handle save finding
  const handleSaveFinding = async (finding: Omit<ToothFinding, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Add to store immediately for UI feedback
      addFinding({
        ...finding,
        patientId,
      });

      // Save to database
      const result = await saveFinding({
        patientId,
        toothNumber: finding.toothNumber,
        surface: finding.surface,
        condition: finding.findingId,
        notes: finding.notes,
      });

      if (result.success) {
        toast.success('Hallazgo registrado correctamente');
        setDialogOpen(false);
        selectTooth(null, null);
      } else {
        toast.error(result.error || 'Error al guardar hallazgo');
      }
    } catch (error) {
      console.error('Error saving finding:', error);
      toast.error('Error al guardar hallazgo');
    }
  };

  // Handle delete finding
  const handleDeleteFinding = async (id: string) => {
    try {
      removeFinding(id);
      
      const result = await deleteFinding(id, patientId);
      if (result.success) {
        toast.success('Hallazgo eliminado');
      } else {
        toast.error(result.error || 'Error al eliminar hallazgo');
        // Reload to restore state
        loadPatientFindings();
      }
    } catch (error) {
      console.error('Error deleting finding:', error);
      toast.error('Error al eliminar hallazgo');
      loadPatientFindings();
    }
  };

  // Handle edit finding (open dialog pre-filled)
  const handleEditFinding = (finding: ToothFinding) => {
    selectTooth(finding.toothNumber, finding.surface);
    // TODO: Pre-fill dialog with existing finding data
    toast.info('Edición de hallazgos próximamente');
  };

  // Handle create lab order
  const handleCreateLabOrder = () => {
    const pendingLabFindings = findings.filter(
      f => f.category === 'lab' && f.status === 'pending'
    );
    
    if (pendingLabFindings.length === 0) {
      toast.info('No hay hallazgos de laboratorio pendientes');
      return;
    }

    openWizard(pendingLabFindings);
  };

  const dentitionType = isChildDentition ? 'child' : 'adult';

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Odontograma V2</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Paciente: <strong>{patientName}</strong>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="dentition-select">Dentición:</Label>
                <Select
                  value={dentitionType}
                  onValueChange={(value) => 
                    setIsChildDentition(value === 'child')
                  }
                  disabled={readonly}
                >
                  <SelectTrigger id="dentition-select" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult">Adulto</SelectItem>
                    <SelectItem value="child">Niño</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              Cargando odontograma...
            </div>
          ) : (
            <ToothChart
              dentition={dentitionType}
              findings={findings}
              selectedTooth={selectedTooth}
              selectedSurface={selectedSurface}
              onToothClick={handleToothClick}
              readonly={readonly}
            />
          )}
        </CardContent>
      </Card>

      {/* Findings Panel */}
      <FindingsPanel
        findings={findings}
        onEdit={handleEditFinding}
        onDelete={handleDeleteFinding}
        onCreateLabOrder={handleCreateLabOrder}
      />

      {/* Finding Dialog */}
      <FindingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tooth={selectedTooth}
        surface={selectedSurface}
        onSave={handleSaveFinding}
      />

      {/* Lab Wizard */}
      <LabWizardV2
        open={wizardOpen}
        onClose={() => {}}
        patientId={patientId}
      />
    </div>
  );
}
