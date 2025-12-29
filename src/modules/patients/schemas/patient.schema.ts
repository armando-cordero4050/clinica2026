import { z } from 'zod';

export const patientSchema = z.object({
  first_name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  last_name: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  id_number: z.string().optional(),
  email: z.string().email({ message: 'Email inválido.' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Fecha inválida"
  }),
  address: z.string().optional(),
  medical_history: z.record(z.any()).default({}), // JSONB
});

export type PatientFormValues = z.infer<typeof patientSchema>;
