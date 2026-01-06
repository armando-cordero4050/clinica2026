// ============================================================================
// CLINICAL V2 - LAB WIZARD STEP 2: ITEMS CONFIGURATION
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ShadeMapSelector } from '@/components/lab/shade-map-selector';
import { useDentalSession } from '../../hooks/use-dental-session';
import { LabOrderItem, ToothNumber } from '../../types';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function StepItems() {
  const { setWizardStep, updateWizardState, wizardState, getPendingLabFindings } = useDentalSession();
  
  const [items, setItems] = useState<LabOrderItem[]>(
    wizardState.items.length > 0 
      ? wizardState.items 
      : [createEmptyItem()]
  );

  function createEmptyItem(): LabOrderItem {
    return {
      configurationId: wizardState.configurationId || '',
      configurationName: wizardState.configurationName,
      toothNumber: 11 as ToothNumber,
      color: '',
      unitPrice: 0,
    };
  }

  const handleAddItem = () => {
    setItems([...items, createEmptyItem()]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error('Debe haber al menos un item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, updates: Partial<LabOrderItem>) => {
    setItems(items.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const handleNext = () => {
    // Validar que todos los items tengan diente y precio
    const invalidItems = items.filter(
      item => !item.toothNumber || item.unitPrice <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('Por favor completa todos los items (diente y precio)');
      return;
    }

    updateWizardState({ items });
    setWizardStep(3);
  };

  const handleBack = () => {
    updateWizardState({ items });
    setWizardStep(1);
  };

  // Sugerir dientes desde hallazgos pendientes
  const pendingFindings = getPendingLabFindings();
  const suggestedTeeth = pendingFindings.map(f => f.toothNumber);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Paso 2: Configurar Items</h3>
        <p className="text-sm text-gray-600">
          Define los dientes, colores y precios para cada item del trabajo
        </p>
        {wizardState.configurationName && (
          <p className="text-sm text-blue-600 mt-1 font-medium">
            Configuración seleccionada: {wizardState.configurationName}
          </p>
        )}
      </div>

      {/* Sugerencias de dientes pendientes */}
      {suggestedTeeth.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Dientes con hallazgos de laboratorio pendientes:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTeeth.map((tooth) => (
              <Button
                key={tooth}
                variant="outline"
                size="sm"
                onClick={() => {
                  const emptyItemIndex = items.findIndex(item => !item.toothNumber || item.toothNumber === 11);
                  if (emptyItemIndex !== -1) {
                    handleUpdateItem(emptyItemIndex, { toothNumber: tooth });
                  } else {
                    setItems([...items, { ...createEmptyItem(), toothNumber: tooth }]);
                  }
                }}
                className="bg-white"
              >
                Diente {tooth}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Número de diente */}
                <div className="space-y-2">
                  <Label htmlFor={`tooth-${index}`}>Diente *</Label>
                  <Input
                    id={`tooth-${index}`}
                    type="number"
                    min="11"
                    max="85"
                    value={item.toothNumber}
                    onChange={(e) => handleUpdateItem(index, { 
                      toothNumber: parseInt(e.target.value) as ToothNumber 
                    })}
                    placeholder="11-48"
                  />
                </div>

                {/* Precio unitario */}
                <div className="space-y-2">
                  <Label htmlFor={`price-${index}`}>Precio (USD) *</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(index, { 
                      unitPrice: parseFloat(e.target.value) || 0 
                    })}
                    placeholder="0.00"
                  />
                </div>

                {/* Selector de color/shade */}
                <div className="space-y-2 md:col-span-1">
                  <Label>Color / Shade</Label>
                  <ShadeMapSelector
                    value={item.color}
                    onChange={(color) => handleUpdateItem(index, { color })}
                  />
                </div>
              </div>

              {/* Botón eliminar */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
                className="mt-8"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Botón agregar item */}
      <Button variant="outline" onClick={handleAddItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Item
      </Button>

      {/* Resumen */}
      <Card className="p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Items:</span>
          <span className="text-lg font-bold">{items.length}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-medium">Total Estimado:</span>
          <span className="text-lg font-bold text-blue-600">
            ${items.reduce((sum, item) => sum + item.unitPrice, 0).toFixed(2)}
          </span>
        </div>
      </Card>

      {/* Botones de navegación */}
      <div className="flex justify-between gap-2 pt-4 border-t">
        <Button variant="outline" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>
        <Button onClick={handleNext}>
          Siguiente
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
