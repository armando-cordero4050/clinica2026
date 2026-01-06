// ============================================================================
// CLINICAL V2 - LAB WIZARD STEP 4: REVIEW AND CONFIRM
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDentalSession } from '../../hooks/use-dental-session';
import { createLabOrder } from '@/actions/lab-orders';
import { ChevronLeft, Check, Loader2, Package, Truck, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export function StepReview() {
  const { 
    setWizardStep, 
    updateWizardState, 
    wizardState, 
    closeWizard,
    patientId,
    updateFinding,
    getLabFindings,
  } = useDentalSession();
  
  const [notes, setNotes] = useState(wizardState.notes || '');
  const [targetDate, setTargetDate] = useState(
    wizardState.targetDeliveryDate || format(addDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    updateWizardState({ notes, targetDeliveryDate: targetDate });
    setWizardStep(3);
  };

  const handleSubmit = async () => {
    if (!patientId) {
      toast.error('ID de paciente no disponible');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Preparar datos de la orden
      const orderData = {
        patient_id: patientId,
        doctor_id: null, // Se obtiene del servidor
        priority: wizardState.priority,
        target_delivery_date: targetDate,
        notes: notes,
        items: wizardState.items.map(item => ({
          configuration_id: item.configurationId,
          tooth_number: item.toothNumber,
          color: item.color,
          unit_price: item.unitPrice,
          clinical_finding_id: item.clinicalFindingId,
        })),
        shipping_type: wizardState.shippingType,
        carrier_name: wizardState.carrierName,
        tracking_number: wizardState.trackingNumber,
        clinic_lat: wizardState.clinicLat,
        clinic_lng: wizardState.clinicLng,
      };

      // Crear la orden
      const result = await createLabOrder(orderData);

      if (result.orderId) {
        toast.success('Orden de laboratorio creada exitosamente');

        // Actualizar hallazgos relacionados con el orderId
        const labFindings = getLabFindings();
        wizardState.items.forEach(item => {
          const relatedFinding = labFindings.find(
            f => f.toothNumber === item.toothNumber && !f.labOrderId
          );
          if (relatedFinding) {
            updateFinding(relatedFinding.id, {
              labOrderId: result.orderId!,
              labOrderStatus: 'pending',
            });
          }
        });

        closeWizard();
      } else {
        toast.error(result.error || 'Error al crear la orden');
      }
    } catch (error: any) {
      toast.error(`Error inesperado: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = wizardState.items.reduce((sum, item) => sum + (item.unitPrice || 0), 0);
  
  const shippingTypeNames: Record<string, string> = {
    pickup: 'Recoger en Clínica',
    courier: 'Envío por Courier',
    digital: 'Digital',
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Paso 4: Revisión y Confirmación</h3>
        <p className="text-sm text-gray-600">
          Revisa todos los detalles antes de crear la orden
        </p>
      </div>

      {/* Resumen de Material */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold">Material y Configuración</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Material:</span>
            <span className="font-medium">{wizardState.materialName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Configuración:</span>
            <span className="font-medium">{wizardState.configurationName}</span>
          </div>
        </div>
      </Card>

      {/* Resumen de Items */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">Items del Trabajo ({wizardState.items.length})</h4>
        <div className="space-y-2">
          {wizardState.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm border-b pb-2">
              <div>
                <span className="font-medium">Diente {item.toothNumber}</span>
                {item.color && <span className="text-gray-600 ml-2">• {item.color}</span>}
              </div>
              <span className="font-medium">${item.unitPrice.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center font-bold text-blue-600 pt-2">
            <span>Total:</span>
            <span className="text-lg">${totalCost.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Resumen de Logística */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold">Logística</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Método de entrega:</span>
            <span className="font-medium">{shippingTypeNames[wizardState.shippingType]}</span>
          </div>
          {wizardState.carrierName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Courier:</span>
              <span className="font-medium">{wizardState.carrierName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Prioridad:</span>
            <Badge variant={wizardState.isUrgent ? 'destructive' : 'secondary'}>
              {wizardState.isUrgent ? 'Urgente' : 'Normal'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Fecha objetivo */}
      <div className="space-y-2">
        <Label htmlFor="target-date" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Fecha Objetivo de Entrega
        </Label>
        <Input
          id="target-date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      {/* Notas adicionales */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas e Instrucciones (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Instrucciones especiales para el laboratorio..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Advertencia */}
      {wizardState.isUrgent && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <strong>Trabajo Urgente:</strong> Esta orden será procesada con prioridad.
              Puede aplicar un recargo del 30-50% sobre el precio base.
            </div>
          </div>
        </Card>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between gap-2 pt-4 border-t">
        <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creando Orden...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Confirmar y Crear Orden
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
