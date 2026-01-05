

import { createClient } from '@/lib/supabase/server';
import { TestWizardWrapper } from './wrapper';

export default async function LabOrderTestPage() {
    const supabase = createClient();
    // Get first active patient
    const { data: patient } = await supabase.from('patients').select('id, first_name, last_name').limit(1).single();

    if (!patient) {
        return <div>No patients found in schema_medical.patients (view public.patients). Seed data first.</div>;
    }

    return (
        <div className="p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Lab Order Wizard Test</h1>
            <p className="mb-4">Testing with Patient: {patient.first_name} {patient.last_name}</p>
            <TestWizardWrapper patientId={patient.id} />
        </div>
    );
}
