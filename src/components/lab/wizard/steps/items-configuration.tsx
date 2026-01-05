'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, AlertCircle } from 'lucide-react';
import { ShadeMapSelector } from '../../shade-map-selector';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ItemsConfigurationProps {
    initialData: any;
    initialSuggestions?: any[];
    onNext: (data: any) => void;
    onBack: () => void;
}

export function ItemsConfiguration({ initialData, initialSuggestions = [], onNext, onBack }: ItemsConfigurationProps) {
    // Get configuration from step 1
    const config = initialData.temp_selected_config;
    
    // Initialize items
    const [items, setItems] = useState<any[]>(() => {
        if (initialData.items?.length > 0) return initialData.items;
        if (!config) return [];

        if (initialSuggestions && initialSuggestions.length > 0) {
            return initialSuggestions.map(s => ({
                configuration_id: config.id,
                config_name: config.name,
                unit_price: config.base_price,
                sla_days: config.sla_days || 3,
                tooth_number: s.toothNumber,
                clinical_finding_id: s.id,
                color: ''
            }));
        }

        // Default single item
        return [{
            configuration_id: config.id,
            config_name: config.name,
            unit_price: config.base_price,
            sla_days: config.sla_days || 3,
            tooth_number: '',
            color: ''
        }];
    });

    // Express order state
    const [isExpress, setIsExpress] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState<string>('');

    // Calculate SLA date (business days only)
    const calculateSlaDate = (sla_days: number) => {
        const date = new Date();
        let daysAdded = 0;
        
        while (daysAdded < sla_days) {
            date.setDate(date.getDate() + 1);
            // Skip weekends
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                daysAdded++;
            }
        }
        
        return date.toISOString().split('T')[0];
    };

    // Auto-calculate delivery date based on SLA
    const autoDeliveryDate = config ? calculateSlaDate(config.sla_days) : '';

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleNext = () => {
        console.log('handleNext called', { items });
        
        // Validation (Relaxed for presentation)
        const invalidItems = items.filter(i => !i.color); // Only require color now
        
        if (invalidItems.length > 0) {
            console.log('Validation failed:', invalidItems);
            toast.error("Por favor selecciona el color.");
            return;
        }

        // Clean up data
        const cleanedItems = items.map(i => {
            // Flatten color if it's an object (from ShadeMapSelector) to prevent rendering errors in Review step
            let colorStr = i.color;
            if (typeof i.color === 'object' && i.color !== null) {
                colorStr = Object.values(i.color).filter(Boolean).join('/');
            }

            return {
                ...i,
                // Default to 0 if empty to prevent blocking
                tooth_number: i.tooth_number ? parseInt(i.tooth_number) : 0,
                unit_price: parseFloat(i.unit_price),
                color: String(colorStr)
            };
        });

        // Use manual date if Express, otherwise use auto-calculated SLA date
        const finalDate = isExpress && deliveryDate 
            ? new Date(deliveryDate) 
            : new Date(autoDeliveryDate);

        console.log('Processed items for next step:', cleanedItems);

        onNext({ 
            items: cleanedItems,
            target_delivery_date: finalDate,
            is_express: isExpress,
            priority: isExpress ? 'urgent' : 'normal'
        });
    };

    if (!config) {
        return (
            <div className="text-center py-12 text-destructive">
                Error: No se seleccionó ninguna configuración en el paso anterior.
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3 h-full flex flex-col"
        >
            <div className="text-center space-y-1 shrink-0">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Detalles de la Orden</h2>
                <p className="text-sm text-muted-foreground">Especifica dientes, color y detalles técnicos.</p>
            </div>

            {/* Items Table */}
            <div className="bg-white border rounded-lg p-3 space-y-3 flex-1 overflow-y-auto min-h-0">
                <div className="grid grid-cols-12 gap-2 md:gap-4 font-medium text-xs md:text-sm text-muted-foreground border-b pb-2 sticky top-0 bg-white">
                    <div className="col-span-3">Trabajo</div>
                    <div className="col-span-2">Diente</div>
                    <div className="col-span-3">Color</div>
                    <div className="col-span-2">Precio</div>
                    <div className="col-span-2">Acción</div>
                </div>

                {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                        <div className="col-span-3 font-medium text-xs md:text-sm">
                            {item.config_name}
                        </div>
                        <div className="col-span-2">
                            <Input 
                                type="text"
                                inputMode="numeric" 
                                placeholder="11" 
                                value={item.tooth_number} 
                                onChange={(e) => {
                                    console.log(`Diente cambiado a: ${e.target.value}`);
                                    updateItem(idx, 'tooth_number', e.target.value);
                                }}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="col-span-3">
                            <ShadeMapSelector 
                                value={item.color}
                                onChange={(val) => updateItem(idx, 'color', val)}
                            />
                        </div>
                        <div className="col-span-2 font-mono text-xs md:text-sm">
                            Q{item.unit_price.toFixed(2)}
                        </div>
                        <div className="col-span-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive h-8 w-8" 
                                onClick={() => removeItem(idx)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Express Order Section */}
            <div className="border rounded-lg p-3 space-y-2 shrink-0">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_express"
                        checked={isExpress}
                        onCheckedChange={(checked) => setIsExpress(checked as boolean)}
                    />
                    <Label htmlFor="is_express" className="text-sm md:text-base font-semibold cursor-pointer">
                        🔥 Orden Express
                    </Label>
                </div>

                {isExpress && (
                    <Alert className="bg-amber-50 border-amber-200 py-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-xs text-amber-800">
                            <strong>Nota:</strong> Las condiciones de Orden Express aún no están definidas.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Delivery Date */}
                <div className="space-y-1">
                    <Label className="text-sm">
                        Fecha de Entrega {isExpress ? '(Manual)' : ''}
                    </Label>
                    
                    {isExpress ? (
                        // Express: Editable date input
                        <>
                            <Input 
                                id="delivery_date"
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="h-9"
                            />
                            <p className="text-xs text-muted-foreground">
                                Puede seleccionar cualquier fecha.
                            </p>
                        </>
                    ) : (
                        // Normal: Read-only display
                        <>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 border rounded-md">
                                <span className="text-sm md:text-base font-semibold text-primary">
                                    {new Date(autoDeliveryDate).toLocaleDateString('es-GT', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                SLA: <strong>{config.sla_days} días hábiles</strong>
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-end border-t pt-2 shrink-0">
                <div className="text-right">
                    <span className="text-xs text-muted-foreground">Total:</span>
                    <div className="text-xl md:text-2xl font-bold text-primary">
                        Q{items.reduce((sum, i) => sum + (parseFloat(i.unit_price) || 0), 0).toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-2 border-t gap-2 shrink-0">
                <Button variant="outline" onClick={onBack} size="sm" className="h-9">
                    Atrás
                </Button>
                <div className="flex gap-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            toast.info("Función 'Revisar Capacidad' próximamente disponible");
                        }}
                        size="sm"
                        className="h-9 text-xs md:text-sm"
                    >
                        Revisar
                    </Button>
                    <Button 
                        type="button"
                        onClick={handleNext} 
                        disabled={items.length === 0} 
                        size="sm"
                        className="h-9"
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
