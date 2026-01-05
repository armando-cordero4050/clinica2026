
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, MapPin, Truck, CloudUpload, Loader } from 'lucide-react';
import { LabOrderFormValues } from '@/lib/validations/lab';
import { createLabOrder } from '@/actions/lab-orders';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ReviewOrderProps {
    formData: LabOrderFormValues;
    onBack: () => void;
    onSubmit: () => void;
}

export function ReviewOrder({ formData, onBack, onSubmit }: ReviewOrderProps) {
    const [submitting, setSubmitting] = useState(false);
    
    // Logistics State
    const [shippingType, setShippingType] = useState('pickup');
    const [carrier, setCarrier] = useState('');
    const [tracking, setTracking] = useState('');
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
    const [locLoading, setLocLoading] = useState(false);

    const getPriorityLabel = (p: string) => p === 'urgent' ? 'Urgente' : 'Normal';

    // Geo-Location Logic
    const detectLocation = () => {
        setLocLoading(true);
        if (!navigator.geolocation) {
            toast.error('Tu navegador no soporta geolocalización');
            setLocLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocLoading(false);
                toast.success('Ubicación capturada correctamente');
            },
            (err) => {
                console.error(err);
                if (err.code === 1) toast.error('Permiso de ubicación denegado. Actívalo en el navegador.');
                else toast.error('Error al obtener ubicación');
                setLocLoading(false);
            }
        );
    };

    const handleConfirm = async () => {
        // Validate Logistics
        if (shippingType === 'courier' && (!carrier || !tracking)) {
            toast.error('Completa los datos de envío (Empresa y Guía)');
            return;
        }

        setSubmitting(true);
        try {
            // Merge form data with logistics
            const orderPayload = {
                ...formData,
                shipping_type: shippingType,
                carrier_name: carrier,
                tracking_number: tracking,
                clinic_lat: location?.lat,
                clinic_lng: location?.lng
            };

            const res = await createLabOrder(orderPayload);
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
                <h2 className="text-2xl font-bold tracking-tight">Resumen y Logística</h2>
                <p className="text-muted-foreground">Define cómo recibiremos el trabajo.</p>
            </div>

            <div className="bg-slate-50 border rounded-lg p-6 space-y-6 text-sm">
                
                {/* Logistics Section */}
                <div className="space-y-4 mb-6">
                    <h4 className="font-semibold flex items-center gap-2 text-base border-b pb-2">
                        <Truck className="h-4 w-4" /> Método de Envío
                    </h4>
                    
                    <RadioGroup 
                        value={shippingType} 
                        onValueChange={setShippingType} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="pickup" id="ship_pickup" className="peer sr-only" />
                            <Label
                                htmlFor="ship_pickup"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer h-full transition-all"
                            >
                                <MapPin className="mb-2 h-6 w-6" />
                                <span className="text-center font-medium">Recolección Local</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="courier" id="ship_courier" className="peer sr-only" />
                            <Label
                                htmlFor="ship_courier"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer h-full transition-all"
                            >
                                <Truck className="mb-2 h-6 w-6" />
                                <span className="text-center font-medium">Paquetería / Guía</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="digital" id="ship_digital" className="peer sr-only" />
                            <Label
                                htmlFor="ship_digital"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary cursor-pointer h-full transition-all"
                            >
                                <CloudUpload className="mb-2 h-6 w-6" />
                                <span className="text-center font-medium">100% Digital</span>
                            </Label>
                        </div>
                    </RadioGroup>

                    {/* Conditional Logistics Inputs */}
                    <div className="mt-4 p-4 bg-white border rounded-md shadow-sm">
                        {shippingType === 'pickup' && (
                            <div className="flex flex-col gap-3">
                                <p className="text-muted-foreground text-xs">
                                    Solicita a un mensajero de DentalFlow que recoja el trabajo físico.
                                    Para agilizar la ruta, confirma la ubicación de la clínica.
                                </p>
                                <Button 
                                    variant={location ? "default" : "secondary"} 
                                    onClick={detectLocation} 
                                    disabled={locLoading}
                                    type="button"
                                    className={`w-full md:w-auto ${location ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                                >
                                    {locLoading ? <Loader className="animate-spin mr-2 h-4 w-4"/> : <MapPin className="mr-2 h-4 w-4" />}
                                    {location ? "Ubicación Capturada (Actualizar)" : "📍 Capturar Ubicación para Mensajero"}
                                </Button>
                                {location && (
                                    <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium bg-green-50 p-2 rounded">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Coordenadas listas para Google Maps
                                    </div>
                                )}
                            </div>
                        )}

                        {shippingType === 'courier' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Empresa de Transporte</Label>
                                    <Input 
                                        placeholder="Ej. Cargo Expreso, Guatex..." 
                                        value={carrier} 
                                        onChange={e => setCarrier(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Número de Guía / Tracking</Label>
                                    <Input 
                                        placeholder="Ej. 1290-9012-00" 
                                        value={tracking} 
                                        onChange={e => setTracking(e.target.value)} 
                                        className="bg-white"
                                    />
                                </div>
                            </div>
                        )}

                        {shippingType === 'digital' && (
                            <div className="text-center py-2 text-muted-foreground bg-blue-50/50 rounded p-2">
                                <p className="text-xs">La orden se creará como DIGITAL. Podrás subir los archivos STL en el detalle de la orden una vez creada.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Detalle de la Orden</h4>
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
                            <div className="font-medium">
                                {formData.target_delivery_date ? new Date(formData.target_delivery_date).toLocaleDateString() : 'Estándar'}
                            </div>
                         </div>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="space-y-2">
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-slate-700 text-xs md:text-sm">
                                <span>{item.config_name || 'Trabajo'} (Diente {item.tooth_number || 'N/A'}, {item.color})</span>
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
                <Button onClick={handleConfirm} disabled={submitting} size="lg" className="flex-1 ml-4">
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Confirmar Orden
                </Button>
            </div>
        </motion.div>
    );
}
