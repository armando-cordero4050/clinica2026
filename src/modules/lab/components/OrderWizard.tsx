import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { orderSchema, OrderFormValues } from '../schemas/order.schema';
import { patientsApi } from '@/modules/patients/api/patients.api';
import { ordersApi } from '../api/orders.api';
import { Trash2, Plus } from 'lucide-react';
import { useSession } from '@/shared/lib/auth';
import { useNavigate } from 'react-router-dom';

export function OrderWizard() {
  const { clinicId, user } = useSession();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      patient_id: '',
      doctor_id: user?.id,
      priority: 'standard',
      delivery_due_date: '',
      shipping_address: '',
      items: [{ service_id: '', price: 0 }] 
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  useEffect(() => {
    if (clinicId) {
        // Load Patients
        patientsApi.getPatients(clinicId).then(setPatients);
        // Load Services
        ordersApi.getServices().then(setServices);
    }
  }, [clinicId]);

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        form.setValue(`items.${index}.service_id`, serviceId);
        form.setValue(`items.${index}.price`, service.base_price);
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    setSubmitting(true);
    try {
        await ordersApi.createOrder(data, clinicId!);
        navigate('/dashboard/lab/kanban'); // or success page
    } catch (error) {
        console.error(error);
        alert('Error creando orden');
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold">Nueva Orden de Laboratorio</h2>
        
        {/* Step 1: Basic Info */}
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {patients.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            <FormField
                control={form.control}
                name="delivery_due_date"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Fecha de Entrega</FormLabel>
                    <FormControl>
                    <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="standard">Estándar</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        {/* Step 2: Items */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Servicios / Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ service_id: '', price: 0 })}>
                    <Plus className="h-4 w-4 mr-2" /> Agregar Item
                </Button>
            </div>
            
            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end border p-4 rounded-md">
                    <div className="flex-1">
                        <FormLabel>Servicio</FormLabel>
                        <Select onValueChange={(val) => handleServiceChange(index, val)} defaultValue={form.getValues(`items.${index}.service_id`)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.name} (${s.base_price})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-24">
                        <FormLabel>Dientes</FormLabel>
                        <Input {...form.register(`items.${index}.tooth_number`)} placeholder="18, 22" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            ))}
            <FormMessage>{form.formState.errors.items?.message}</FormMessage>
        </div>

        <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
                {submitting ? 'Creando Orden...' : 'Confirmar Orden'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
