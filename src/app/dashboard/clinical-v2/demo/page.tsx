// ============================================================================
// CLINICAL V2 - DEMO PAGE
// ============================================================================

import { createClient } from '@/lib/supabase/server';
import { OdontogramDemo } from './odontogram-demo';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default async function ClinicalV2DemoPage() {
  const supabase = await createClient();

  // Obtener un paciente de prueba
  const { data: patient } = await supabase
    .from('patients')
    .select('id, first_name, last_name')
    .limit(1)
    .single();

  if (!patient) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Clinical V2 - Demo</h1>
        <p className="text-red-500">
          No patients found. Please seed the database first.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Clinical V2 - Odontograma y Lab Wizard</h1>
        <p className="text-gray-600">
          Sistema completo de registro de hallazgos dentales y gestión de órdenes de laboratorio
        </p>
      </div>
      
      <OdontogramDemo 
        patientId={patient.id} 
        patientName={`${patient.first_name} ${patient.last_name}`}
      />
    </div>
  );
}
