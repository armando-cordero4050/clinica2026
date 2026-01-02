import { z } from 'zod';

export const appointmentSchema = z.object({
  patient_id: z.string().uuid("Seleccione un paciente"),
  doctor_id: z.string().uuid("Seleccione un doctor").optional().nullable(),
  title: z.string().min(3, "El título es muy corto"),
  start_time: z.date({ required_error: "Fecha de inicio requerida" }),
  end_time: z.date({ required_error: "Fecha de fin requerida" }),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']).default('scheduled'),
}).refine((data) => data.end_time > data.start_time, {
  message: "La hora de fin debe ser posterior a la de inicio",
  path: ["end_time"],
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
