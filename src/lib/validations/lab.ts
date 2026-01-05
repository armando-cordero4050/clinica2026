
import { z } from 'zod';

export const labOrderFormSchema = z.object({
  patient_id: z.string().uuid({ message: 'Patient is required' }),
  doctor_id: z.string().uuid().optional(),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  target_delivery_date: z.date().optional(),
  notes: z.string().optional(),
  
  // Logistics
  shipping_type: z.enum(['pickup', 'courier', 'digital']).optional().default('pickup'),
  carrier_name: z.string().optional(),
  tracking_number: z.string().optional(),
  clinic_lat: z.number().optional(),
  clinic_lng: z.number().optional(),

  items: z.array(z.object({
    configuration_id: z.string().uuid(),
    config_name: z.string().optional(), // For UI display
    tooth_number: z.number().optional(), // Relaxed validation
    color: z.string().min(1, { message: 'Shade is required' }), 

    unit_price: z.number().min(0),
    clinical_finding_id: z.string().uuid().optional(),
  })).min(1, { message: 'At least one item is required' })
});

export type LabOrderFormValues = z.infer<typeof labOrderFormSchema>;
