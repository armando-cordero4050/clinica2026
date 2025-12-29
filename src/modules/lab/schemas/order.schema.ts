import { z } from 'zod';

export const orderItemSchema = z.object({
  service_id: z.string().min(1, 'Debe seleccionar un servicio'),
  tooth_number: z.string().optional(), // "18", "21-23", etc.
  notes: z.string().optional(),
  price: z.number().min(0), // Snapshot price at time of order
});

export const orderSchema = z.object({
  patient_id: z.string().min(1, 'Debe seleccionar un paciente'),
  doctor_id: z.string().optional(), // Defaults to current user if doctor
  priority: z.enum(['standard', 'urgent']).default('standard'),
  delivery_due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Fecha de entrega requerida"
  }),
  shipping_address: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'Debe agregar al menos un item a la orden'),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
export type OrderItemFormValues = z.infer<typeof orderItemSchema>;
