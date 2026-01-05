
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { LabOrderFormValues } from '@/lib/validations/lab';
import { createLabOrder } from '@/actions/lab-orders';
import { toast } from 'sonner';

interface ReviewOrderProps {
    formData: LabOrderFormValues;
    onBack: () => void;
    onSubmit: () => void;
}

export function ReviewOrder({ formData, onBack, onSubmit }: ReviewOrderProps) {
    const [submitting, setSubmitting] = useState(false);

    const getPriorityLabel = (p: string) => p === 'urgent' ? 'Urgente' : 'Normal';

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const res = await createLabOrder(formData);
            if (res.error) {
                toast.error(res.error);
                setSubmitting(false);
            } else {
                toast.success('Orden creada exitosamente');
                onSubmit(); // Closes modal
            }
        } catch (e) {
            toast.error('Error de conexión');
            setSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Resumen de la Orden</h2>
                <p className="text-muted-foreground">Verifica la información antes de enviar al laboratorio.</p>
            </div>

            <div className="bg-slate-50 border rounded-lg p-6 space-y-6 text-sm">
                
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <span className="text-muted-foreground block">Prioridad</span>
                        <span className={`font-medium ${formData.priority === 'urgent' ? 'text-orange-600' : ''}`}>
                            {getPriorityLabel(formData.priority)}
                        </span>
                     </div>
                     <div>
                        <span className="text-muted-foreground block">Items</span>
                        <span className="font-medium">{formData.items.length} unidades</span>
                     </div>
                     <div className="col-span-2">
                        <span className="text-muted-foreground block mb-1">Fecha Estimada de Entrega</span>
                        {/* Since we don't have a robust Calendar component yet, we use native date input or simple display if readonly */}
                        <div className="font-medium">
                            {formData.target_delivery_date ? new Date(formData.target_delivery_date).toLocaleDateString() : 'Estándar'}
                        </div>
                     </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Detalle de Items</h4>
                    <div className="space-y-2">
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-slate-700">
                                <span>{item.config_name || 'Trabajo'} (Diente {item.tooth_number}, Color {item.color})</span>
                                <span>${item.unit_price}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                     <span className="font-bold text-xl text-primary">
                        ${formData.items.reduce((sum, i) => sum + (i.unit_price || 0), 0).toFixed(2)}
                    </span>
                </div>
            </div>

             <div className="flex justify-between pt-8">
                <Button variant="outline" onClick={onBack} size="lg" disabled={submitting}>
                    Atrás
                </Button>
                <Button onClick={handleConfirm} disabled={submitting} size="lg" className="w-full ml-4">
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Confirmar Orden
                </Button>
            </div>
        </motion.div>
    );
}

