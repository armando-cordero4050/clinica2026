'use client'

import { useState, useEffect } from 'react'
import { getOrdersWithDetails, syncOrdersFromOdoo } from '@/modules/medical/actions/orders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  RefreshCw,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  clinic_name: string
  patient_name: string
  patient_id: string | null
  doctor_name: string
  staff_name: string | null
  status: string
  priority: string
  due_date: string | null
  price: number
  odoo_sale_order_id: number | null
  created_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadOrders = async () => {
    setLoading(true)
    const data = await getOrdersWithDetails()
    setOrders(data as Order[])
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    toast.info('Sincronizando órdenes desde Odoo...')
    
    const result = await syncOrdersFromOdoo()
    
    if (result.success) {
      toast.success(result.message)
      await loadOrders()
    } else {
      toast.error(result.message)
    }
    
    setSyncing(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-600',
    design: 'bg-yellow-600',
    milling: 'bg-orange-600',
    ceramic: 'bg-purple-600',
    qc: 'bg-pink-600',
    ready: 'bg-green-600',
    delivered: 'bg-gray-600'
  }

  return (
    <div className="space-y-6 container max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Órdenes de Laboratorio</h1>
            <p className="text-muted-foreground italic">Órdenes sincronizadas con Odoo</p>
          </div>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Total Órdenes</p>
                <p className="text-3xl font-bold text-indigo-600">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">En Proceso</p>
                <p className="text-3xl font-bold text-orange-600">
                  {orders.filter(o => !['delivered', 'ready'].includes(o.status)).length}
                </p>
              </div>
              <Loader2 className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Completadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Total Facturado</p>
                <p className="text-xl font-bold text-purple-600">
                  Q{orders.reduce((sum, o) => sum + (o.price || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="py-12 text-center text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hay órdenes</p>
              <p className="text-sm mt-1">Sincroniza desde Odoo o crea una nueva orden</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      {order.patient_name}
                      {order.patient_id && (
                        <span className="text-sm text-gray-500 font-normal">
                          (ID: {order.patient_id})
                        </span>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      {order.clinic_name}
                    </div>
                  </div>
                  <Badge className={statusColors[order.status] || 'bg-gray-600'}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Solicitado por</p>
                      <p className="font-medium">{order.staff_name || order.doctor_name}</p>
                    </div>
                  </div>

                  {order.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha entrega</p>
                        <p className="font-medium">
                          {new Date(order.due_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Precio</p>
                      <p className="font-bold text-green-600">Q{order.price.toFixed(2)}</p>
                    </div>
                  </div>

                  {order.odoo_sale_order_id && (
                    <div className="text-sm">
                      <p className="text-xs text-gray-500">Odoo SO</p>
                      <p className="font-mono text-xs">{order.odoo_sale_order_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
