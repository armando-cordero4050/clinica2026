// ============================================================================
// CLINICAL V2 - ODONTOGRAM DEMO CLIENT WRAPPER
// ============================================================================

'use client';

import { Odontogram } from '@/modules/clinical-v2/components/odontogram';
import { LabWizard } from '@/modules/clinical-v2/components/lab-wizard';
import { useDentalSession } from '@/modules/clinical-v2/hooks/use-dental-session';
import { Toaster } from 'sonner';

interface OdontogramDemoProps {
  patientId: string;
  patientName: string;
}

export function OdontogramDemo({ patientId, patientName }: OdontogramDemoProps) {
  const { openWizard, getPendingLabFindings } = useDentalSession();

  const handleOpenLabWizard = () => {
    const pendingFindings = getPendingLabFindings();
    
    // Pre-populate wizard with pending findings
    const initialItems = pendingFindings.map(finding => ({
      configurationId: '', // Se seleccionará en el wizard
      toothNumber: finding.toothNumber,
      color: '',
      unitPrice: 0,
      clinicalFindingId: finding.id,
    }));

    openWizard(initialItems);
  };

  return (
    <>
      <Odontogram 
        patientId={patientId}
        patientName={patientName}
        onOpenLabWizard={handleOpenLabWizard}
      />
      
      <LabWizard />
      
      <Toaster position="top-right" richColors />
    </>
  );
}
