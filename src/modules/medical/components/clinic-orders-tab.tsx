'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { getClinicOrders } from '../actions/orders'

interface ClinicOrdersTabProps {
  clinicId: string
}

export function ClinicOrdersTab({ clinicId }: ClinicOrdersTabProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const data = await getClinicOrders(clinicId)
      setOrders(data)
      setLoading(false)
    }
    loadOrders()
  }, [clinicId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clinic_pending': return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Pendiente Recolección</Badge>
      case 'digital_picking': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Digital Picking</Badge>
      case 'income_validation': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Validación Ingreso</Badge>
      case 'gypsum': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Yesos / Modelos</Badge>
      case 'design': return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">En Diseño</Badge>
      case 'client_approval': return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Pendiente Aprobación</Badge>
      case 'nesting': return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Nesting / Impresión</Badge>
      case 'production_man': return <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">Producción MAN</Badge>
      case 'qa': return <Badge variant="outline" className="bg-cyan-50 text-cyan-600 border-cyan-200">Control Calidad</Badge>
      case 'billing': return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Facturación</Badge>
      case 'delivery': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Enviado / Entregado</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Clock className="animate-spin h-8 w-8 text-gray-300" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="py-12 text-center text-gray-400">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Historial de Órdenes Vacío</p>
          <p className="text-sm mt-1">
            Aún no hay órdenes de laboratorio registradas para esta clínica.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Listado de Órdenes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="text-sm">
                  {new Date(order.created_at).toLocaleDateString('es-GT')}
                </TableCell>
                <TableCell className="font-medium">{order.patient_name}</TableCell>
                <TableCell className="text-sm text-gray-500">{order.doctor_name || 'N/A'}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right font-mono font-bold">
                   ${Number(order.total_price || 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
