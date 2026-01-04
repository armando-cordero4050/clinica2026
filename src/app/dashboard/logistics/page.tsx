import { getPendingPickups } from '@/modules/logistics/actions'
import { PendingPickupsTable } from '@/modules/logistics/components/pending-pickups-table'
import { Package, Truck, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function LogisticsPage() {
  const pendingOrders = await getPendingPickups()

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Truck className="h-8 w-8 text-blue-600" />
            Logística y Rutas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de recolecciones y entregas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            <Package className="h-4 w-4 mr-2" />
            {pendingOrders.length} Pendientes
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Recolecciones Pendientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingOrders.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En Ruta</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completadas Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Pickups Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Órdenes Pendientes de Recolección</h2>
          <p className="text-sm text-gray-500 mt-1">
            Asigna estas órdenes a mensajeros para coordinar la recolección
          </p>
        </div>
        <PendingPickupsTable orders={pendingOrders} />
      </div>
    </div>
  )
}
