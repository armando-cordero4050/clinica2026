'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientDialog } from './patient-dialog';
import { useState } from 'react';

interface PatientHeaderProps {
  clinicId: string;
}

export function PatientHeader({ clinicId }: PatientHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Paciente
      </Button>

      <PatientDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        clinicId={clinicId}
      />
    </>
  );
}
