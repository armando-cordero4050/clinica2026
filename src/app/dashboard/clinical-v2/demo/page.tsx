/**
 * Clinical V2 Demo Page
 * Test page for the new clinical module
 */

import { createClient } from '@/lib/supabase/server';
import { OdontogramV2 } from '@/modules/clinical-v2/components/odontogram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Force dynamic rendering to avoid build-time database access
export const dynamic = 'force-dynamic';

export default async function ClinicalV2DemoPage() {
  const supabase = await createClient();

  // Get a test patient
  const { data: patient, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, birth_date')
    .limit(1)
    .single();

  if (error || !patient) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Clinical V2 Demo</CardTitle>
            <CardDescription>
              Módulo de prueba del nuevo sistema de odontograma y órdenes de laboratorio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10">
              <p className="text-red-500 font-semibold">
                No se encontraron pacientes en la base de datos
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Por favor, agrega pacientes para probar el módulo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const patientFullName = `${patient.first_name} ${patient.last_name}`;

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Clinical V2 Demo</CardTitle>
              <CardDescription>
                Módulo completamente nuevo y aislado para pruebas
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              BETA
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              ℹ️ Información del Módulo
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Este módulo es completamente independiente del sistema actual</li>
              <li>Puedes probar todas las funcionalidades sin afectar datos existentes</li>
              <li>Incluye odontograma interactivo y wizard de órdenes de laboratorio</li>
              <li>Los datos se guardan en las mismas tablas usando RPCs existentes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Odontogram V2 */}
      <OdontogramV2
        patientId={patient.id}
        patientName={patientFullName}
        initialDentition="adult"
      />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Cómo Usar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h5 className="font-semibold mb-2">1. Registrar Hallazgos</h5>
              <p className="text-muted-foreground">
                Haz clic en cualquier superficie de un diente en el odontograma para abrir el diálogo de hallazgos.
                Selecciona un hallazgo clínico o de laboratorio y guárdalo.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-2">2. Crear Orden de Laboratorio</h5>
              <p className="text-muted-foreground">
                Después de registrar hallazgos que requieren trabajo de laboratorio, haz clic en el botón
                "Crear Orden de Lab" en el panel de hallazgos. Esto abrirá el wizard de 4 pasos.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-2">3. Wizard de Orden</h5>
              <ul className="text-muted-foreground list-disc list-inside ml-4 space-y-1">
                <li><strong>Paso 1:</strong> Selecciona material, tipo y configuración</li>
                <li><strong>Paso 2:</strong> Configura items (diente, color, precio)</li>
                <li><strong>Paso 3:</strong> Define tipo de envío y logística</li>
                <li><strong>Paso 4:</strong> Revisa y confirma la orden</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-2">4. Verificar Resultado</h5>
              <p className="text-muted-foreground">
                Una vez creada la orden, aparecerá en el kanban de laboratorio en la columna "1. Clínica".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
