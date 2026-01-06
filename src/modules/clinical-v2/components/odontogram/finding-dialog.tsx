/**
 * Clinical V2 - Finding Dialog Component
 * Modal for adding/editing tooth findings
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FindingDialogProps } from '../../types';
import { FINDINGS_CATALOG, SURFACES } from '../../constants/dental';
import { cn } from '@/lib/utils';

export function FindingDialog({
  open,
  onOpenChange,
  tooth,
  surface,
  onSave,
}: FindingDialogProps) {
  const [selectedFinding, setSelectedFinding] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [askForOrder, setAskForOrder] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedFinding('');
      setNotes('');
      setAskForOrder(false);
    }
  }, [open]);

  const handleSave = () => {
    if (!tooth || !surface || !selectedFinding) return;

    const finding = FINDINGS_CATALOG.find(f => f.id === selectedFinding);
    if (!finding) return;

    onSave({
      patientId: '', // Will be set by parent component
      toothNumber: tooth,
      surface,
      findingId: finding.id,
      findingName: finding.name,
      category: finding.category,
      color: finding.color,
      status: 'pending',
      notes: notes || undefined,
    });

    // If it's a lab finding, show option to create order
    if (finding.requiresLab) {
      setAskForOrder(true);
    } else {
      onOpenChange(false);
    }
  };

  const surfaceInfo = SURFACES.find(s => s.id === surface);

  // Group findings by category
  const clinicalFindings = FINDINGS_CATALOG.filter(
    f => !f.requiresLab
  );
  const labFindings = FINDINGS_CATALOG.filter(f => f.requiresLab);

  if (askForOrder) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Crear orden de laboratorio?</DialogTitle>
            <DialogDescription>
              Has registrado un hallazgo que requiere trabajo de laboratorio.
              ¿Deseas crear la orden ahora?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAskForOrder(false);
                onOpenChange(false);
              }}
            >
              Después
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setAskForOrder(false);
                onOpenChange(false);
                // TODO: Trigger wizard opening from parent
              }}
            >
              Crear Orden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Hallazgo</DialogTitle>
          <DialogDescription>
            Diente: <strong>{tooth}</strong> | Superficie:{' '}
            <strong>{surfaceInfo?.name || surface}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Clinical Findings */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Hallazgos Clínicos
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {clinicalFindings.map((finding) => (
                <button
                  key={finding.id}
                  onClick={() => setSelectedFinding(finding.id)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    'hover:border-blue-300 hover:shadow-sm',
                    selectedFinding === finding.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: finding.color }}
                    />
                    <span className="font-medium text-sm">
                      {finding.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {finding.treatment}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Lab Findings */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Trabajo de Laboratorio
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {labFindings.map((finding) => (
                <button
                  key={finding.id}
                  onClick={() => setSelectedFinding(finding.id)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    'hover:border-purple-300 hover:shadow-sm',
                    selectedFinding === finding.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: finding.color }}
                    />
                    <span className="font-medium text-sm">
                      {finding.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {finding.treatment}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Lab
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedFinding}
          >
            Guardar Hallazgo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
