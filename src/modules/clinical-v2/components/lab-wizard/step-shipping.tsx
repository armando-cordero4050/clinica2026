/**
 * Clinical V2 - Lab Wizard Step 3: Shipping & Logistics
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Package, Truck, Globe, MapPin } from 'lucide-react';
import { useDentalSession } from '../../hooks/use-dental-session';
import { ShippingType } from '../../types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function StepShipping() {
  const { wizardState, updateWizardState } = useDentalSession();
  const [capturingLocation, setCapturingLocation] = useState(false);

  if (!wizardState) return null;

  const handleShippingTypeChange = (type: ShippingType) => {
    updateWizardState({
      shippingType: type,
      carrierName: type === 'pickup' ? undefined : wizardState.carrierName,
      trackingNumber: undefined,
    });
  };

  const handleCaptureLocation = () => {
    setCapturingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateWizardState({
            clinicLat: position.coords.latitude,
            clinicLng: position.coords.longitude,
          });
          toast.success('Ubicación capturada correctamente');
          setCapturingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('No se pudo obtener la ubicación');
          setCapturingLocation(false);
        }
      );
    } else {
      toast.error('Geolocalización no disponible en este navegador');
      setCapturingLocation(false);
    }
  };

  const shippingOptions = [
    {
      value: 'pickup' as ShippingType,
      label: 'Recoger en Clínica',
      description: 'El laboratorio recogerá el trabajo en la clínica',
      icon: Package,
    },
    {
      value: 'courier' as ShippingType,
      label: 'Mensajería',
      description: 'Envío por servicio de mensajería/courier',
      icon: Truck,
    },
    {
      value: 'digital' as ShippingType,
      label: 'Digital',
      description: 'Trabajo digital (sin envío físico)',
      icon: Globe,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tipo de Envío</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona cómo se entregará el trabajo del laboratorio
        </p>

        <RadioGroup
          value={wizardState.shippingType}
          onValueChange={handleShippingTypeChange}
        >
          <div className="grid gap-3">
            {shippingOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all',
                    'hover:border-blue-300 hover:shadow-md',
                    wizardState.shippingType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  )}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Carrier Details (for courier) */}
      {wizardState.shippingType === 'courier' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="carrier-name">Nombre de la Mensajería</Label>
              <Input
                id="carrier-name"
                placeholder="Ej: FedEx, DHL, UPS"
                value={wizardState.carrierName || ''}
                onChange={(e) =>
                  updateWizardState({ carrierName: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="tracking-number">
                Número de Guía (opcional)
              </Label>
              <Input
                id="tracking-number"
                placeholder="Número de seguimiento"
                value={wizardState.trackingNumber || ''}
                onChange={(e) =>
                  updateWizardState({ trackingNumber: e.target.value })
                }
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Capture */}
      {(wizardState.shippingType === 'pickup' ||
        wizardState.shippingType === 'courier') && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base">Ubicación de la Clínica</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Captura la ubicación GPS para facilitar la logística
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCaptureLocation}
                disabled={capturingLocation}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                {capturingLocation ? 'Capturando...' : 'Capturar Ubicación'}
              </Button>
            </div>

            {wizardState.clinicLat && wizardState.clinicLng && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm">
                <p className="font-semibold text-green-900 mb-1">
                  ✓ Ubicación capturada
                </p>
                <p className="text-green-700 font-mono text-xs">
                  Lat: {wizardState.clinicLat.toFixed(6)}, Lng:{' '}
                  {wizardState.clinicLng.toFixed(6)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      <Card>
        <CardContent className="pt-6">
          <Label htmlFor="shipping-notes">Notas de Logística (opcional)</Label>
          <textarea
            id="shipping-notes"
            placeholder="Instrucciones especiales de entrega, horarios, contacto, etc."
            value={wizardState.notes || ''}
            onChange={(e) => updateWizardState({ notes: e.target.value })}
            className="mt-2 w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
          />
        </CardContent>
      </Card>
    </div>
  );
}
