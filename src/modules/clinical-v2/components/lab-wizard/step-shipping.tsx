// ============================================================================
// CLINICAL V2 - LAB WIZARD STEP 3: SHIPPING/LOGISTICS
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { useDentalSession } from '../../hooks/use-dental-session';
import { ShippingType } from '../../types';
import { ChevronLeft, ChevronRight, Truck, Package, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function StepShipping() {
  const { setWizardStep, updateWizardState, wizardState } = useDentalSession();
  
  const [shippingType, setShippingType] = useState<ShippingType>(
    wizardState.shippingType || 'pickup'
  );
  const [carrierName, setCarrierName] = useState(wizardState.carrierName || '');
  const [trackingNumber, setTrackingNumber] = useState(wizardState.trackingNumber || '');
  const [isUrgent, setIsUrgent] = useState(wizardState.isUrgent || false);

  const handleNext = () => {
    // Validar campos requeridos según el tipo de envío
    if (shippingType === 'courier' && !carrierName) {
      toast.error('Por favor ingresa el nombre del courier');
      return;
    }

    updateWizardState({
      shippingType,
      carrierName: shippingType === 'courier' ? carrierName : undefined,
      trackingNumber: shippingType === 'courier' ? trackingNumber : undefined,
      isUrgent,
      priority: isUrgent ? 'urgent' : 'normal',
    });

    setWizardStep(4);
  };

  const handleBack = () => {
    updateWizardState({
      shippingType,
      carrierName,
      trackingNumber,
      isUrgent,
    });
    setWizardStep(2);
  };

  const shippingOptions = [
    {
      value: 'pickup' as ShippingType,
      icon: Package,
      title: 'Recoger en Clínica',
      description: 'El laboratorio recoge el trabajo en la clínica',
    },
    {
      value: 'courier' as ShippingType,
      icon: Truck,
      title: 'Envío por Courier',
      description: 'Enviamos el trabajo mediante servicio de mensajería',
    },
    {
      value: 'digital' as ShippingType,
      icon: Globe,
      title: 'Digital',
      description: 'Trabajo digital (archivos CAD/CAM, impresión 3D)',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Paso 3: Logística y Envío</h3>
        <p className="text-sm text-gray-600">
          Define cómo se manejará el envío del trabajo de laboratorio
        </p>
      </div>

      {/* Tipo de envío */}
      <div className="space-y-3">
        <Label>Método de Entrega *</Label>
        <RadioGroup value={shippingType} onValueChange={(value) => setShippingType(value as ShippingType)}>
          {shippingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                htmlFor={option.value}
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingType === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                <Icon className="h-6 w-6 flex-shrink-0 mt-0.5 text-gray-600" />
                <div className="flex-1">
                  <div className="font-semibold text-sm">{option.title}</div>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Campos condicionales para courier */}
      {shippingType === 'courier' && (
        <Card className="p-4 space-y-4 bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <Label htmlFor="carrier">Nombre del Courier *</Label>
            <Input
              id="carrier"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              placeholder="Ej: FedEx, DHL, UPS"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tracking">Número de Seguimiento (opcional)</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking number"
            />
          </div>
        </Card>
      )}

      {/* Info adicional para pickup */}
      {shippingType === 'pickup' && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700">
            <strong>Nota:</strong> El laboratorio coordinará la fecha y hora de recogida con la clínica.
            Recibirás una notificación cuando el trabajo esté listo.
          </p>
        </Card>
      )}

      {/* Info adicional para digital */}
      {shippingType === 'digital' && (
        <Card className="p-4 bg-gray-50">
          <p className="text-sm text-gray-700">
            <strong>Nota:</strong> Los archivos digitales (STL, diseños CAD, etc.) serán enviados
            por correo electrónico o compartidos mediante enlace seguro.
          </p>
        </Card>
      )}

      {/* Checkbox de urgente */}
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="urgent"
            checked={isUrgent}
            onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
          />
          <div className="flex-1">
            <Label
              htmlFor="urgent"
              className="font-semibold cursor-pointer"
            >
              Marcar como Urgente
            </Label>
            <p className="text-xs text-gray-600 mt-1">
              Los trabajos urgentes tienen prioridad en el laboratorio y pueden tener costo adicional.
              El tiempo de entrega se reduce aproximadamente a la mitad del SLA estándar.
            </p>
          </div>
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
