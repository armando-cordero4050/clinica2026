'use client'

import { useState, useEffect } from 'react'
import { getSyncedServices, syncServicesFromOdoo } from '@/modules/lab/actions/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wrench, 
  RefreshCw,
  Loader2,
  DollarSign,
  Package
} from 'lucide-react'
import { toast } from 'sonner'

interface Service {
  id: string
  code: string
  name: string
  category: string
  base_price: number
  is_active: boolean
  odoo_id: number | null
  odoo_category: string | null
  last_synced_from_odoo: string | null
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadServices = async () => {
    setLoading(true)
    const data = await getSyncedServices()
    setServices(data as Service[])
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    toast.info('Iniciando sincronización de servicios desde Odoo...')
    
    const result = await syncServicesFromOdoo()
    
    if (result.success) {
      toast.success(result.message)
      await loadServices()
    } else {
      toast.error(result.message)
    }
    
    setSyncing(false)
  }

  useEffect(() => {
    loadServices()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 container max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Servicios de Laboratorio</h1>
            <p className="text-muted-foreground italic">Catálogo de servicios sincronizados desde Odoo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar desde Odoo'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Total Servicios</p>
                <p className="text-3xl font-bold text-indigo-600">{services.length}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Activos</p>
                <p className="text-3xl font-bold text-green-600">
                  {services.filter(s => s.is_active).length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Última Sincronización</p>
                <p className="text-sm font-bold text-purple-600">
                  {services.length > 0 && services[0].last_synced_from_odoo 
                    ? new Date(services[0].last_synced_from_odoo).toLocaleDateString('es-ES')
                    : 'N/A'
                  }
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <Card className="col-span-full border-none shadow-md">
            <CardContent className="py-12 text-center text-gray-400">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hay servicios sincronizados</p>
              <p className="text-sm mt-1">Sincroniza servicios desde Odoo para comenzar</p>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    {service.name}
                  </CardTitle>
                  <Badge className={service.is_active ? 'bg-green-600' : 'bg-gray-400'}>
                    {service.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-mono font-bold text-gray-700">{service.code}</span>
                </div>

                {service.category && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                )}

                {service.base_price > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-bold text-green-600">
                      Q{service.base_price.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Odoo ID: {service.odoo_id || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
