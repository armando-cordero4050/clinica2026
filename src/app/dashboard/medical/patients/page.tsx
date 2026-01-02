import { Suspense } from 'react';
import { getPatients, getPatientStats } from '@/modules/medical/actions/patients';
import { getUserClinic } from '@/modules/medical/actions/clinics';
import { PatientTable } from '@/modules/medical/components/patient-table';
import { PatientHeader } from '@/modules/medical/components/patient-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserPlus } from 'lucide-react';

export const metadata = {
  title: 'Pacientes | DentalFlow',
  description: 'Gestión de pacientes de la clínica dental',
};

export default async function PatientsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Suspense fallback={<HeaderSkeleton />}>
        <PatientsContent />
      </Suspense>
    </div>
  );
}

async function PatientsContent() {
  // Get user's clinic
  const clinicResult = await getUserClinic();

  if (!clinicResult.success || !clinicResult.data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No se encontró clínica asociada. Por favor contacta al administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clinic = clinicResult.data;

  // Fetch patients and stats in parallel
  const [patientsResult, statsResult] = await Promise.all([
    getPatients(clinic.id),
    getPatientStats(clinic.id),
  ]);

  const patients = patientsResult.success ? patientsResult.data : [];
  const stats = statsResult.success ? statsResult.data : { totalPatients: 0, newThisMonth: 0 };

  return (
    <>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gestiona los expedientes clínicos de tus pacientes
          </p>
        </div>

        <PatientHeader clinicId={clinic.id} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Pacientes</p>
              <h3 className="text-2xl font-bold">{stats.totalPatients}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <UserPlus className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nuevos Este Mes</p>
              <h3 className="text-2xl font-bold">{stats.newThisMonth}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <PatientTable patients={patients} clinicId={clinic.id} />
    </>
  );
}

function HeaderSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      <Skeleton className="h-[400px]" />
    </>
  );
}
