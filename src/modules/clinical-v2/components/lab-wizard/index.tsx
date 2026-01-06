/**
 * Clinical V2 - Lab Wizard Container
 * Multi-step wizard for creating lab orders
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LabWizardV2Props } from '../../types';
import { useDentalSession } from '../../hooks/use-dental-session';
import { StepMaterial } from './step-material';
import { StepItems } from './step-items';
import { StepShipping } from './step-shipping';
import { StepReview } from './step-review';

const STEPS = [
  { id: 1, name: 'Material', description: 'Seleccionar material y configuración' },
  { id: 2, name: 'Items', description: 'Configurar dientes y colores' },
  { id: 3, name: 'Logística', description: 'Tipo de envío' },
  { id: 4, name: 'Revisión', description: 'Confirmar orden' },
];

export function LabWizardV2({
  open,
  onClose,
  initialItems,
  patientId,
}: LabWizardV2Props) {
  const {
    wizardStep,
    wizardState,
    setWizardStep,
    updateWizardState,
    closeWizard,
  } = useDentalSession();

  const currentStep = wizardStep;
  const progress = (currentStep / STEPS.length) * 100;

  const canGoNext = () => {
    if (!wizardState) return false;

    switch (currentStep) {
      case 1:
        return !!wizardState.selectedConfigurationId;
      case 2:
        return wizardState.items.length > 0;
      case 3:
        return !!wizardState.shippingType;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setWizardStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setWizardStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    closeWizard();
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepMaterial />;
      case 2:
        return <StepItems />;
      case 3:
        return <StepShipping />;
      case 4:
        return <StepReview onClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nueva Orden de Laboratorio</DialogTitle>
          <DialogDescription>
            Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1]?.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id === currentStep ? 'font-semibold text-foreground' : ''
                }`}
              >
                {step.name}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
