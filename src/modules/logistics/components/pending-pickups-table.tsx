'use client'

import { useState } from 'react'
import { PendingPickup, assignOrderToCourier } from '../actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function PendingPickupsTable({ orders }: { orders: PendingPickup[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleAssignToMe = async (orderId: string) => {
    setLoading(orderId)
    try {
      // Get current user ID (in a real app, this would come from auth context)
      const result = await assignOrderToCourier(orderId, 'self', 'pickup')
      
      if (result.success) {
        toast.success('Orden asignada correctamente')
      } else {
        toast.error(result.message || 'Error al asignar orden')
      }
    } catch (error) {
      toast.error('Error al asignar orden')
    } finally {
      setLoading(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No hay órdenes pendientes de recolección</p>
        <p className="text-sm text-gray-400 mt-1">Las nuevas órdenes aparecerán aquí</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No. Orden</TableHead>
          <TableHead>Clínica</TableHead>
          <TableHead>Dirección</TableHead>
          <TableHead>Paciente</TableHead>
          <TableHead>Servicio</TableHead>
          <TableHead>Fecha Límite</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.order_id}>
            <TableCell className="font-mono text-sm">
              {order.order_number.slice(0, 8)}
            </TableCell>
            <TableCell className="font-medium">{order.clinic_name}</TableCell>
            <TableCell className="text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {order.clinic_address || 'Sin dirección'}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-gray-400" />
                {order.patient_name}
              </div>
            </TableCell>
            <TableCell className="text-sm">{order.service_name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3 text-gray-400" />
                {format(new Date(order.due_date), 'dd/MM/yyyy')}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={order.priority === 'urgent' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {order.priority === 'urgent' ? 'Urgente' : 'Normal'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                onClick={() => handleAssignToMe(order.order_id)}
                disabled={loading === order.order_id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading === order.order_id ? 'Asignando...' : 'Asignarme'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
