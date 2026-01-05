
import { z } from 'zod';

export const labOrderFormSchema = z.object({
  patient_id: z.string().uuid({ message: 'Patient is required' }),
  doctor_id: z.string().uuid().optional(),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  target_delivery_date: z.date().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    configuration_id: z.string().uuid(),
    config_name: z.string().optional(), // For UI display
    tooth_number: z.number().min(11).max(85), // ISO system validation could be more robust
    color: z.string().min(1, { message: 'Shade is required' }), 

    unit_price: z.number().min(0),
    clinical_finding_id: z.string().uuid().optional(),
    // For UI purposes, we might need more info, but this is for DB payload
  })).min(1, { message: 'At least one item is required' })
});

export type LabOrderFormValues = z.infer<typeof labOrderFormSchema>;
