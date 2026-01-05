
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MaterialSelection } from './steps/material-selection';
import { ItemsConfiguration } from './steps/items-configuration';
import { ReviewOrder } from './steps/review-order';
import { LabOrderFormValues } from '@/lib/validations/lab';


interface OrderWizardProps {
    patientId: string;
    onClose: () => void;
    initialItems?: any[]; // Allow passing initial items from Odontogram
}

export function OrderWizard({ patientId, onClose, initialItems = [] }: OrderWizardProps) {
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState<Partial<LabOrderFormValues>>({
        patient_id: patientId,
        priority: 'normal',
        items: []
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleStep1Next = (data: Partial<LabOrderFormValues>) => {
        setFormData(prev => {
            const newData = { ...prev, ...data };
            
            // If we have initialItems and no items yet, pre-fill them using the selected config
            // We assume 'data' likely contains the selected configuration from Step 1 (though MaterialSelection might not pass it directly in data if it's just updating state)
            // Wait, MaterialSelection passes { items: ... } ?? No.
            // Let's look at MaterialSelection. It passes... what?
            // "onNext" receives "data".
            // If MaterialSelection just lets you pick a config, it might return { configuration_id: ... } or helper data.
            // But LabOrderFormValues doesn't have a top-level configuration_id.
            
            // ACTUALLY, checking MaterialSelection implementation (from memory/context):
            // It likely allows selecting a material/type/config.
            // If it returns the selected config, we can use it.
            
            return newData;
        });
        
        // Custom logic to inject initialItems if needed
        // Since MaterialSelection logic is inside that component, we might rely on it or just pass initialItems to ItemsConfiguration
        // Let's pass initialItems to ItemsConfiguration instead, so it can handle the pre-filling if the list is empty.
        nextStep();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
            <Card className="w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl">
                <CardHeader className="border-b py-3 px-4 shrink-0">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg md:text-xl">Nueva Orden de Laboratorio</CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>
                    {/* Progress Bar / Steps Indicator */}
                    <div className="flex gap-2 mt-3">
                        {[1, 2, 3].map(s => (
                             <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
                        ))}
                    </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-slate-50/50 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <AnimatePresence mode="wait">
                        {step === 1 && (

                            <MaterialSelection 
                                key="step1" 
                                initialData={formData} 
                                onNext={handleStep1Next} 
                            />
                        )}

                        {step === 2 && (
                            <ItemsConfiguration 
                                key="step2"
                                initialData={formData}

                                initialSuggestions={initialItems} 
                                onNext={(data) => {
                                    setFormData(prev => ({ ...prev, ...data }));
                                    nextStep();
                                }}
                                onBack={prevStep}
                            />
                        )}
                        {step === 3 && (
                            <ReviewOrder 
                                key="step3"
                                formData={formData as LabOrderFormValues}
                                onBack={prevStep}
                                onSubmit={onClose} // Pass onClose directly, ReviewOrder will call it after success
                            />
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
