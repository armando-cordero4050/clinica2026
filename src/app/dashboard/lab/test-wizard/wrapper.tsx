
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OrderWizard } from '@/components/lab/wizard/order-wizard';

export function TestWizardWrapper({ patientId }: { patientId: string }) {
    const [showWizard, setShowWizard] = useState(false);

    return (
        <>
            <Button onClick={() => setShowWizard(true)}>
                Open Wizard
            </Button>

            {showWizard && (
                <OrderWizard 
                    patientId={patientId}
                    onClose={() => setShowWizard(false)}
                />
            )}
        </>
    );
}
