// ============================================================================
// CLINICAL V2 - FINDING DIALOG
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ToothNumber, ToothSurface } from '../../types';
import { FINDINGS_CATALOG, getFindingsByCategory } from '../../constants/dental';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface FindingDialogProps {
  open: boolean;
  onClose: () => void;
  toothNumber: ToothNumber;
  surface: ToothSurface;
  onSave: (findingId: string, notes?: string) => void;
}

export function FindingDialog({ 
  open, 
  onClose, 
  toothNumber, 
  surface, 
  onSave 
}: FindingDialogProps) {
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState<'clinical' | 'lab' | 'existing'>('clinical');

  const handleSave = () => {
    if (!selectedFindingId) return;
    onSave(selectedFindingId, notes);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFindingId(null);
    setNotes('');
    setActiveCategory('clinical');
    onClose();
  };

  const clinicalFindings = getFindingsByCategory('clinical');
  const labFindings = getFindingsByCategory('lab');
  const existingFindings = getFindingsByCategory('existing');

  const getCurrentFindings = () => {
    switch (activeCategory) {
      case 'clinical':
        return clinicalFindings;
      case 'lab':
        return labFindings;
      case 'existing':
        return existingFindings;
      default:
        return [];
    }
  };

  const surfaceNames: Record<ToothSurface, string> = {
    oclusal: 'Oclusal',
    mesial: 'Mesial',
    distal: 'Distal',
    vestibular: 'Vestibular',
    lingual: 'Lingual',
    whole: 'Todo el diente',
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Registrar Hallazgo - Diente {toothNumber} ({surfaceNames[surface]})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tabs de categorías */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveCategory('clinical')}
              className={cn(
                'px-4 py-2 font-medium transition-colors border-b-2',
                activeCategory === 'clinical'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Clínicos ({clinicalFindings.length})
            </button>
            <button
              onClick={() => setActiveCategory('lab')}
              className={cn(
                'px-4 py-2 font-medium transition-colors border-b-2',
                activeCategory === 'lab'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Laboratorio ({labFindings.length})
            </button>
            <button
              onClick={() => setActiveCategory('existing')}
              className={cn(
                'px-4 py-2 font-medium transition-colors border-b-2',
                activeCategory === 'existing'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Existentes ({existingFindings.length})
            </button>
          </div>

          {/* Grid de hallazgos */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getCurrentFindings().map((finding) => (
              <button
                key={finding.id}
                onClick={() => setSelectedFindingId(finding.id)}
                className={cn(
                  'relative p-4 border-2 rounded-lg text-left transition-all hover:shadow-md',
                  selectedFindingId === finding.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {selectedFindingId === finding.id && (
                  <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-blue-600" />
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: finding.color }}
                  />
                  <span className="font-semibold text-sm">{finding.name}</span>
                </div>
                
                {finding.shortName && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {finding.shortName}
                  </Badge>
                )}
                
                {finding.description && (
                  <p className="text-xs text-gray-600 mt-1">{finding.description}</p>
                )}
                
                {finding.requiresLabOrder && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Requiere Lab
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Notas opcionales */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar observaciones adicionales..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedFindingId}
          >
            Guardar Hallazgo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
