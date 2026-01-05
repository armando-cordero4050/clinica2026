'use client';

import { useState } from 'react';
import { LabCatalog, LabMaterial, LabMaterialType, LabConfiguration } from '@/types/lab';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface OrderWizardProps {
  catalog: LabCatalog;
}

export default function OrderWizard({ catalog }: OrderWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);

  const selectedMaterial = catalog.materials.find(m => m.id === selectedMaterialId);
  const selectedType = selectedMaterial?.types.find(t => t.id === selectedTypeId);

  const handleNext = () => {
    if (step === 1 && selectedMaterialId) setStep(2);
    else if (step === 2 && selectedTypeId) setStep(3);
    else if (step === 3 && selectedConfigId) setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar / Progress */}
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pasos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {[
               { num: 1, label: 'Material', status: step === 1 ? 'current' : step > 1 ? 'complete' : 'pending' },
               { num: 2, label: 'Tipo', status: step === 2 ? 'current' : step > 2 ? 'complete' : 'pending' },
               { num: 3, label: 'Configuración', status: step === 3 ? 'current' : step > 3 ? 'complete' : 'pending' },
               { num: 4, label: 'Detalles', status: step === 4 ? 'current' : step > 4 ? 'complete' : 'pending' },
             ].map((s) => (
               <div key={s.num} className={cn("flex items-center gap-3 p-2 rounded-lg transition-colors", 
                 s.status === 'current' ? "bg-primary/10 text-primary font-medium" : 
                 s.status === 'complete' ? "text-green-600" : "text-slate-400"
               )}>
                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm",
                    s.status === 'current' ? "border-primary bg-background" : 
                    s.status === 'complete' ? "border-green-600 bg-green-600 text-white" : "border-slate-200"
                 )}>
                   {s.status === 'complete' ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                 </div>
                 <span>{s.label}</span>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Step 1: Material */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Seleccione Material</CardTitle>
              <CardDescription>¿De qué material será la prótesis?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedMaterialId || ''} onValueChange={setSelectedMaterialId} className="grid grid-cols-1 gap-4">
                {catalog.materials.map((mat) => (
                  <div key={mat.id}>
                    <RadioGroupItem value={mat.id} id={mat.id} className="peer sr-only" />
                    <Label
                      htmlFor={mat.id}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <span className="font-semibold text-lg">{mat.name}</span>
                      {selectedMaterialId === mat.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Type */}
        {step === 2 && selectedMaterial && (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de {selectedMaterial.name}</CardTitle>
              <CardDescription>Especifique la variante del material</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedTypeId || ''} onValueChange={setSelectedTypeId} className="grid grid-cols-1 gap-4">
                {selectedMaterial.types.map((type) => (
                   <div key={type.id}>
                   <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                   <Label
                     htmlFor={type.id}
                     className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 cursor-pointer transition-all"
                   >
                     <span className="font-semibold text-lg">{type.name}</span>
                     {selectedTypeId === type.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                   </Label>
                 </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && selectedType && (
           <Card>
           <CardHeader>
             <CardTitle>Configuración</CardTitle>
             <CardDescription>¿Qué tipo de trabajo desea realizar?</CardDescription>
           </CardHeader>
           <CardContent>
             <RadioGroup value={selectedConfigId || ''} onValueChange={setSelectedConfigId} className="grid grid-cols-1 gap-4">
               {selectedType.configurations.map((config) => (
                  <div key={config.id}>
                  <RadioGroupItem value={config.id} id={config.id} className="peer sr-only" />
                  <Label
                    htmlFor={config.id}
                    className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    <div>
                        <span className="font-semibold text-lg block">{config.name}</span>
                        <span className="text-sm text-slate-500 capitalize">{config.category}</span>
                    </div>
                    {selectedConfigId === config.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </Label>
                </div>
               ))}
             </RadioGroup>
           </CardContent>
         </Card>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            Atrás
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={
                (step === 1 && !selectedMaterialId) || 
                (step === 2 && !selectedTypeId) || 
                (step === 3 && !selectedConfigId)
            }
          >
            {step === 4 ? 'Confirmar' : 'Siguiente'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

      </div>
    </div>
  );
}
