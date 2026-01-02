import { Suspense } from 'react'
import { getClinicServicePrices, getLabServices } from '@/modules/medical/actions/services'
import { getLastSyncInfo } from '@/modules/medical/actions/sync-services'
import { getUserClinic } from '@/modules/medical/actions/clinics'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, DollarSign } from 'lucide-react'
import { ServicesTable } from './services-table'
import { AddServiceModal } from './add-service-modal'
import { SyncDebugPanel } from './sync-debug-panel'

export const metadata = {
  title: 'Servicios | DentalFlow',
  description: 'Gestión de servicios y precios de venta',
}

export default async function ServicesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Suspense fallback={<PageSkeleton />}>
        <ServicesContent />
      </Suspense>
    </div>
  )
}

async function ServicesContent() {
  // Get user's clinic
  const clinicResult = await getUserClinic()

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
    )
  }

  const clinic = clinicResult.data

  // Fetch clinic service prices, lab services, and last sync in parallel
  const [pricesResult, labServicesResult, lastSyncResult] = await Promise.all([
    getClinicServicePrices(clinic.id),
    getLabServices(),
    getLastSyncInfo(clinic.id),
  ])

  const servicePrices = pricesResult.success ? pricesResult.data : []
  const labServices = labServicesResult.success ? labServicesResult.data : []
  const lastSync = lastSyncResult.success ? lastSyncResult.data : null

  // Calculate stats
  const totalServices = servicePrices.length
  const availableServices = servicePrices.filter(s => s.is_available).length
  const avgMargin = servicePrices.length > 0
    ? servicePrices.reduce((sum, s) => sum + (s.margin_percentage || 0), 0) / servicePrices.length
    : 0

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona los precios de venta de servicios de laboratorio
          </p>
        </div>

        <AddServiceModal clinicId={clinic.id} labServices={labServices} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Servicios</p>
              <h3 className="text-2xl font-bold">{totalServices}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Disponibles</p>
              <h3 className="text-2xl font-bold">{availableServices}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-teal-100 p-3 dark:bg-teal-900">
              <DollarSign className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Margen Promedio</p>
              <h3 className="text-2xl font-bold">{avgMargin.toFixed(1)}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Panel - Development Only */}
      <SyncDebugPanel clinicId={clinic.id} lastSyncInfo={lastSync} />

      {/* Services Table */}
      <ServicesTable services={servicePrices} clinicId={clinic.id} />
    </>
  )
}

function PageSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      <Skeleton className="h-[400px]" />
    </>
  )
}
