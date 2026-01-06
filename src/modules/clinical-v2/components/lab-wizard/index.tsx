// ============================================================================
// CLINICAL V2 - LAB WIZARD MAIN COMPONENT
// ============================================================================

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useDentalSession } from '../../hooks/use-dental-session';
import { StepMaterial } from './step-material';
import { StepItems } from './step-items';
import { StepShipping } from './step-shipping';
import { StepReview } from './step-review';
import { AnimatePresence, motion } from 'framer-motion';

export function LabWizard() {
  const { wizardOpen, closeWizard, wizardState } = useDentalSession();

  const steps = [
    { number: 1, title: 'Material', component: StepMaterial },
    { number: 2, title: 'Items', component: StepItems },
    { number: 3, title: 'Envío', component: StepShipping },
    { number: 4, title: 'Revisión', component: StepReview },
  ];

  const currentStep = wizardState.step;
  const progress = (currentStep / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <Dialog open={wizardOpen} onOpenChange={closeWizard}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crear Orden de Laboratorio
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-2 mb-4">
          <Progress value={progress} className="h-2" />
          
          {/* Steps indicator */}
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-2 ${
                  step.number < currentStep
                    ? 'text-green-600'
                    : step.number === currentStep
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step.number < currentStep
                      ? 'bg-green-100 border-green-600'
                      : step.number === currentStep
                      ? 'bg-blue-100 border-blue-600'
                      : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  {step.number < currentStep ? '✓' : step.number}
                </div>
                <span className="text-sm hidden md:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {CurrentStepComponent && <CurrentStepComponent />}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
