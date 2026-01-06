
import { createClient } from '@/lib/supabase/server';
import { TestWizardWrapper } from './wrapper';

// Forzar renderizado dinámico (no pre-renderizar en build)
export const dynamic = 'force-dynamic';

export default async function LabOrderTestPage() {
    const supabase = await createClient();
    
    const { data: patient } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .limit(1)
        .single();

    if (!patient) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Lab Order Wizard Test</h1>
                <p className="text-red-500">
                    No patients found. Please seed the database first.
                </p>
            </div>
        );
    }

    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Lab Order Wizard Test</h1>
            <p className="mb-4">
                Testing with Patient: {patient.first_name} {patient.last_name}
            </p>
            <TestWizardWrapper patientId={patient.id} />
        </div>
    );
}
