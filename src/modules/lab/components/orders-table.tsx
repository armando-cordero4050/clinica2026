'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { KanbanCard } from '../actions'
import { Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrdersTableProps {
  orders: KanbanCard[]
}

export function LabOrdersTable({ orders }: OrdersTableProps) {
  // Client-side timer for SLA
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000) // Update every second for real-time countdown
    return () => clearInterval(timer)
  }, [])

  const getSLARemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const diff = due.getTime() - now.getTime()
    
    if (diff < 0) return { text: 'ATRASADO', color: 'text-red-600 font-bold' }
    
    const totalSeconds = Math.floor(diff / 1000)
    const days = Math.floor(totalSeconds / (24 * 60 * 60))
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const seconds = totalSeconds % 60
    
    if (days > 0) {
      return { 
        text: `${days}d ${hours}h ${minutes}m ${seconds}s`, 
        color: 'text-green-600 font-mono' 
      }
    }
    if (hours > 0) {
      return { 
        text: `${hours}h ${minutes}m ${seconds}s`, 
        color: 'text-orange-600 font-medium font-mono' 
      }
    }
    return { 
      text: `${minutes}m ${seconds}s`, 
      color: 'text-red-500 font-bold font-mono' 
    }
  }

  const getStatusBadge = (status: string) => {
     const config: Record<string, { label: string, color: string }> = {
        'clinic_pending': { label: 'Pendiente Clínica', color: 'bg-slate-100 text-slate-700' },
        'digital_picking': { label: 'Picking Digital', color: 'bg-blue-100 text-blue-700' },
        'income_validation': { label: 'Validación Ingreso', color: 'bg-cyan-100 text-cyan-700' },
        'gypsum': { label: 'Yeso', color: 'bg-amber-100 text-amber-700' },
        'design': { label: 'Diseño', color: 'bg-purple-100 text-purple-700' },
        'client_approval': { label: 'Aprobación Cliente', color: 'bg-indigo-100 text-indigo-700' },
        'nesting': { label: 'Nesting', color: 'bg-violet-100 text-violet-700' },
        'production_man': { label: 'Producción Manual', color: 'bg-pink-100 text-pink-700' },
        'qa': { label: 'Control Calidad', color: 'bg-orange-100 text-orange-700' },
        'billing': { label: 'Facturación', color: 'bg-emerald-100 text-emerald-700' },
        'delivery': { label: 'Entrega', color: 'bg-green-100 text-green-700' },
     }
     const s = config[status] || { label: status, color: 'bg-gray-100' }
     return <Badge className={`${s.color} border-none`}>{s.label}</Badge>
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="font-bold">No. Orden</TableHead>
            <TableHead className="font-bold">Clínica (Cliente)</TableHead>
            <TableHead className="font-bold">Doctor</TableHead>
            <TableHead className="font-bold">Servicio</TableHead>
            <TableHead className="font-bold">Estado</TableHead>
            <TableHead className="font-bold">SLA Restante</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
             <TableRow>
               <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                 No hay órdenes activas para mostrar.
               </TableCell>
             </TableRow>
          ) : (
            orders.map((order) => {
              const sla = getSLARemaining(order.due_date)
              return (
                <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-mono text-xs text-blue-600">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {order.clinic_name || 'Desconocida'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {order.doctor_name || 'Dr. Wong'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="font-medium">{order.product_name}</span>
                       <span className="text-[10px] text-gray-400 capitalize">{order.priority} Priority</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Clock className={`h-3 w-3 ${sla.color.includes('red') ? 'text-red-500' : 'text-gray-400'}`} />
                       <span className={`text-xs ${sla.color}`}>{sla.text}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                       <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
