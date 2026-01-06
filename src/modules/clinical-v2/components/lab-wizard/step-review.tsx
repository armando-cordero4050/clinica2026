/**
 * Clinical V2 - Lab Wizard Step 4: Review & Confirm
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useDentalSession } from '../../hooks/use-dental-session';
import { createLabOrderV2 } from '../../actions';
import { toast } from 'sonner';

interface StepReviewProps {
  onClose: () => void;
}

export function StepReview({ onClose }: StepReviewProps) {
  const { wizardState, updateWizardState } = useDentalSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!wizardState) return null;

  const total = wizardState.items.reduce((sum, item) => sum + item.unitPrice, 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await createLabOrderV2({
        patientId: wizardState.patientId,
        doctorId: wizardState.doctorId,
        priority: wizardState.priority,
        targetDeliveryDate: wizardState.targetDeliveryDate,
        notes: wizardState.notes,
        items: wizardState.items.map((item) => ({
          configurationId: item.configurationId,
          toothNumber: item.toothNumber,
          color: item.color,
          unitPrice: item.unitPrice,
          clinicalFindingId: item.clinicalFindingId,
        })),
        shippingType: wizardState.shippingType,
        carrierName: wizardState.carrierName,
        trackingNumber: wizardState.trackingNumber,
        clinicLat: wizardState.clinicLat,
        clinicLng: wizardState.clinicLng,
      });

      if (result.success) {
        setOrderCreated(true);
        setOrderId(result.orderId || null);
        toast.success('Orden de laboratorio creada exitosamente');
        
        // Update findings status to 'in_progress'
        // This would be done via server action in production
      } else {
        toast.error(result.error || 'Error al crear la orden');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al crear la orden de laboratorio');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderCreated) {
    return (
      <div className="text-center py-10 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-bold">¡Orden Creada!</h3>
        <p className="text-muted-foreground">
          La orden de laboratorio se ha creado exitosamente
        </p>
        {orderId && (
          <p className="text-sm font-mono bg-muted px-4 py-2 rounded inline-block">
            ID: {orderId}
          </p>
        )}
        <div className="pt-4">
          <Button onClick={onClose} size="lg">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Revisión de la Orden</h3>
        <p className="text-sm text-muted-foreground">
          Verifica que toda la información sea correcta antes de crear la orden
        </p>
      </div>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Material:</span>
            <span className="font-medium">
              {wizardState.configurationDetails?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">SLA:</span>
            <span className="font-medium">
              {wizardState.configurationDetails?.slaDays} días
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prioridad:</span>
            <Badge variant={wizardState.priority === 'urgent' ? 'destructive' : 'secondary'}>
              {wizardState.priority === 'urgent' ? 'Urgente' : 'Normal'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Items Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Items ({wizardState.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wizardState.items.map((item, index) => (
              <div key={item.id}>
                {index > 0 && <Separator className="my-3" />}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{item.configurationName}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="font-mono">Diente {item.toothNumber}</span>
                      {item.toothSurface && (
                        <span className="ml-2 capitalize">
                          • {item.toothSurface}
                        </span>
                      )}
                    </div>
                    {item.color && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Color: {item.color}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">
                    ${item.unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logística</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo de envío:</span>
            <span className="font-medium capitalize">
              {wizardState.shippingType === 'pickup' && 'Recoger en Clínica'}
              {wizardState.shippingType === 'courier' && 'Mensajería'}
              {wizardState.shippingType === 'digital' && 'Digital'}
            </span>
          </div>
          
          {wizardState.carrierName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mensajería:</span>
              <span className="font-medium">{wizardState.carrierName}</span>
            </div>
          )}

          {wizardState.clinicLat && wizardState.clinicLng && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ubicación:</span>
              <span className="font-mono text-xs">
                {wizardState.clinicLat.toFixed(4)}, {wizardState.clinicLng.toFixed(4)}
              </span>
            </div>
          )}

          {wizardState.notes && (
            <div className="pt-2">
              <span className="text-muted-foreground block mb-1">Notas:</span>
              <p className="text-sm bg-muted p-2 rounded">
                {wizardState.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Total de la Orden:</span>
            <span className="text-3xl font-bold">${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando Orden...
            </>
          ) : (
            'Confirmar y Crear Orden'
          )}
        </Button>
      </div>
    </div>
  );
}
