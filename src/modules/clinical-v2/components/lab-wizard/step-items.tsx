/**
 * Clinical V2 - Lab Wizard Step 2: Items Configuration
 */

'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { ShadeMapSelector } from '@/components/lab/shade-map-selector';
import { useDentalSession } from '../../hooks/use-dental-session';
import { LabOrderItem } from '../../types';

export function StepItems() {
  const { wizardState, updateWizardState } = useDentalSession();

  if (!wizardState) return null;

  const handleColorChange = (itemId: string, color: string) => {
    const updatedItems = wizardState.items.map((item) =>
      item.id === itemId ? { ...item, color } : item
    );
    updateWizardState({ items: updatedItems });
  };

  const handlePriceChange = (itemId: string, price: number) => {
    const updatedItems = wizardState.items.map((item) =>
      item.id === itemId ? { ...item, unitPrice: price } : item
    );
    updateWizardState({ items: updatedItems });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = wizardState.items.filter((item) => item.id !== itemId);
    updateWizardState({ items: updatedItems });
  };

  const handleAddItem = () => {
    if (!wizardState.configurationDetails) return;

    const newItem: LabOrderItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      configurationId: wizardState.selectedConfigurationId || '',
      configurationName: wizardState.configurationDetails.name,
      toothNumber: 11, // Default tooth, user should change
      color: '',
      unitPrice: wizardState.configurationDetails.basePrice,
    };

    updateWizardState({
      items: [...wizardState.items, newItem],
    });
  };

  const total = wizardState.items.reduce((sum, item) => sum + item.unitPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Items de la Orden</h3>
          <p className="text-sm text-muted-foreground">
            Configuración: <strong>{wizardState.configurationDetails?.name}</strong>
          </p>
        </div>
        <Button onClick={handleAddItem} size="sm" variant="outline">
          + Agregar Item
        </Button>
      </div>

      {wizardState.items.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            No hay items en la orden.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Los items se agregaron automáticamente desde los hallazgos de laboratorio,
            o puedes agregar manualmente.
          </p>
          <Button onClick={handleAddItem} className="mt-4" variant="outline">
            + Agregar Primer Item
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Diente</TableHead>
                  <TableHead>Configuración</TableHead>
                  <TableHead className="w-[250px]">Color</TableHead>
                  <TableHead className="w-[120px]">Precio</TableHead>
                  <TableHead className="w-[80px] text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wizardState.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.toothNumber}
                        onChange={(e) => {
                          const toothNum = parseInt(e.target.value) || 11;
                          const updatedItems = wizardState.items.map((i) =>
                            i.id === item.id
                              ? { ...i, toothNumber: toothNum as import('../../types').ToothNumber }
                              : i
                          );
                          updateWizardState({ items: updatedItems });
                        }}
                        className="w-20 h-8"
                        min="11"
                        max="85"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {item.configurationName}
                      </div>
                      {item.toothSurface && (
                        <div className="text-xs text-muted-foreground capitalize">
                          Superficie: {item.toothSurface}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <ShadeMapSelector
                        value={item.color}
                        onChange={(color) => handleColorChange(item.id, color)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-28 h-8"
                        min="0"
                        step="10"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="bg-muted rounded-lg p-4 min-w-[250px]">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {wizardState.items.length} item(s)
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
