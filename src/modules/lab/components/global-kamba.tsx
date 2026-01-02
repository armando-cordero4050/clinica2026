'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Truck, 
  Monitor, 
  ClipboardCheck, 
  Layers, 
  PenTool, 
  UserCheck, 
  Cpu, 
  Hammer, 
  Search, 
  Receipt, 
  Send,
  Clock,
  Pause,
  Play,
  CheckCircle2,
  Undo2,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react'
import { KanbanCard, updateCardStatus, pauseOrder } from '../actions'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const KAMBA_COLUMNS = [
  { id: 'clinic_pending', label: '1. Clínica', icon: Truck, color: 'bg-gray-50' },
  { id: 'digital_picking', label: '2. Digital', icon: Monitor, color: 'bg-blue-50' },
  { id: 'income_validation', label: '3. Ingresos', icon: ClipboardCheck, color: 'bg-emerald-50' },
  { id: 'gypsum', label: '4. Yesos', icon: Layers, color: 'bg-amber-50' },
  { id: 'design', label: '5. Diseño', icon: PenTool, color: 'bg-indigo-50' },
  { id: 'client_approval', label: '6. Aprobación', icon: UserCheck, color: 'bg-purple-50' },
  { id: 'nesting', label: '7. Nesting', icon: Cpu, color: 'bg-orange-50' },
  { id: 'production_man', label: '8. MAN', icon: Hammer, color: 'bg-pink-50' },
  { id: 'qa', label: '9. QA', icon: Search, color: 'bg-cyan-50' },
  { id: 'billing', label: '10. Facturar', icon: Receipt, color: 'bg-green-50' },
  { id: 'delivery', label: '11. Delivery', icon: Send, color: 'bg-slate-50' },
]

export function GlobalKamba({ initialOrders, userRole }: { initialOrders: KanbanCard[], userRole: string }) {
  const [orders, setOrders] = useState(initialOrders)
  const [activeModal, setActiveModal] = useState<'details' | 'return' | 'pause' | 'confirm' | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<KanbanCard | null>(null)
  const [justification, setJustification] = useState('')
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  const handleForward = (order: KanbanCard) => {
    const currentIndex = KAMBA_COLUMNS.findIndex(c => c.id === order.status)
    let nextIndex = currentIndex + 1
    
    if (nextIndex >= KAMBA_COLUMNS.length) return

    // Digital skip logic
    if (order.status === 'income_validation' && order.is_digital) {
      nextIndex = KAMBA_COLUMNS.findIndex(c => c.id === 'design')
    }

    const nextStatus = KAMBA_COLUMNS[nextIndex].id

    // Role Restriction for Billing (Col 10)
    if (nextStatus === 'billing' && !['lab_admin', 'lab_coordinator', 'super_admin'].includes(userRole)) {
       toast.error('No tienes permisos para pasar órdenes a Facturación.')
       return
    }

    setSelectedOrder(order)
    setPendingStatus(nextStatus)
    setActiveModal('confirm')
  }

  const handleBackward = (order: KanbanCard) => {
    const currentIndex = KAMBA_COLUMNS.findIndex(c => c.id === order.status)
    const prevIndex = currentIndex - 1
    
    if (prevIndex < 0) return

    setSelectedOrder(order)
    setPendingStatus(KAMBA_COLUMNS[prevIndex].id)
    setActiveModal('return')
  }

  const handlePauseRequest = (order: KanbanCard) => {
    setSelectedOrder(order)
    setActiveModal('pause')
  }

  const executeMove = async (reason?: string) => {
    if (!selectedOrder || !pendingStatus) return
    try {
      await updateCardStatus(selectedOrder.id, pendingStatus, reason)
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: pendingStatus } : o))
      toast.success(`Orden movida exitosamente`)
      closeModals()
    } catch {
      toast.error('Error al mover la orden')
    }
  }

  const executePause = async () => {
    if (!selectedOrder || !justification) return
    try {
      await pauseOrder(selectedOrder.id, justification)
      toast.info('Solicitud de pausa enviada a Coordinación')
      closeModals()
    } catch {
      toast.error('Error al solicitar pausa')
    }
  }

  const closeModals = () => {
    setActiveModal(null)
    setSelectedOrder(null)
    setJustification('')
    setPendingStatus(null)
  }

  const getOrdersInStatus = (status: string) => orders.filter(o => o.status === status)

  return (
    <div className="w-full flex flex-col gap-2 bg-white p-2 rounded-xl shadow-inner overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1">
         <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Layers className="h-4 w-4" /> GLOBAL KAMBA WORKFLOW
         </h2>
         <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1">
               <Button 
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`h-7 px-2 text-[10px] ${viewMode === 'kanban' ? 'shadow-sm' : ''}`}
                  onClick={() => setViewMode('kanban')}
               >
                  <LayoutGrid className="h-3 w-3 mr-1" /> Kanban
               </Button>
               <Button 
                  variant={viewMode === 'table' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={`h-7 px-2 text-[10px] ${viewMode === 'table' ? 'shadow-sm' : ''}`}
                  onClick={() => setViewMode('table')}
               >
                  <TableIcon className="h-3 w-3 mr-1" /> Tabla
               </Button>
            </div>
            <div className="hidden md:flex gap-4 text-[10px] text-gray-400 font-medium">
               <span className="flex items-center gap-1 uppercase tracking-widest border-r pr-4 border-gray-100 italic">Role: {userRole}</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> Digital</span>
               <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Proceso Bio</span>
            </div>
         </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex flex-row w-full h-[750px] gap-2 select-none overflow-x-auto pb-4 custom-scrollbar">
          {KAMBA_COLUMNS.map((col) => (
            <div 
              key={col.id} 
              className={`flex-1 min-w-[200px] max-w-[280px] flex flex-col rounded-lg border border-gray-100 ${col.color} transition-all duration-300 shadow-sm`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-gray-200/50 flex flex-col items-center text-center gap-1">
                 <col.icon className="h-4 w-4 text-gray-500" />
                 <span className="text-[10px] font-bold uppercase tracking-tight text-gray-700 truncate w-full">
                    {col.label}
                 </span>
                 <Badge variant="secondary" className="text-[9px] h-4 px-2 bg-white/80 font-mono shadow-sm">
                    {getOrdersInStatus(col.id).length} órdenes
                 </Badge>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
                 {getOrdersInStatus(col.id).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 opacity-20 mt-10">
                       <Layers className="h-8 w-8 mb-2" />
                       <span className="text-[10px] font-bold uppercase">Sin Órdenes</span>
                    </div>
                 ) : (
                    getOrdersInStatus(col.id).map((order) => (
                      <KambaCard 
                        key={order.id} 
                        order={order} 
                        onForward={() => handleForward(order)}
                        onBackward={() => handleBackward(order)}
                        onPause={() => handlePauseRequest(order)}
                        onDetails={() => { setSelectedOrder(order); setActiveModal('details'); }}
                      />
                    ))
                 )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full bg-white rounded-lg border border-gray-100 overflow-hidden">
           <Table>
              <TableHeader className="bg-gray-50">
                 <TableRow>
                    <TableHead className="w-[80px] text-[10px] font-bold uppercase">#</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Etapa de Producción</TableHead>
                    <TableHead className="text-center text-[10px] font-bold uppercase">Órdenes</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Descripción</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase">Acciones</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {KAMBA_COLUMNS.map((col, idx) => (
                    <TableRow key={col.id} className="hover:bg-gray-50/50 group">
                       <TableCell className="font-mono text-[11px] text-gray-400">{idx + 1}</TableCell>
                       <TableCell>
                          <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-md ${col.color}`}>
                                <col.icon className="h-3.5 w-3.5 text-gray-600" />
                             </div>
                             <span className="font-bold text-sm text-gray-700">{col.label}</span>
                          </div>
                       </TableCell>
                       <TableCell className="text-center">
                          <Badge 
                             variant={getOrdersInStatus(col.id).length > 0 ? "default" : "outline"}
                             className={`font-mono ${getOrdersInStatus(col.id).length > 0 ? 'bg-blue-600' : 'text-gray-300 border-gray-200'}`}
                          >
                             {getOrdersInStatus(col.id).length}
                          </Badge>
                       </TableCell>
                       <TableCell className="text-[11px] text-gray-400 italic">
                          {col.id === 'clinic_pending' && 'Esperando recolección o envío desde la clínica.'}
                          {col.id === 'digital_picking' && 'Preparación de archivos digitales y modelos.'}
                          {col.id === 'income_validation' && 'Validación de materiales y requerimientos.'}
                          {col.id === 'gypsum' && 'Vaciado de modelos y articulación.'}
                          {col.id === 'design' && 'Diseño CAD/CAM de la restauración.'}
                          {col.id === 'client_approval' && 'Esperando visto bueno del doctor.'}
                          {col.id === 'nesting' && 'Preparación de fresado o impresión 3D.'}
                          {col.id === 'production_man' && 'Acabado manual, cerámica y pulido.'}
                          {col.id === 'qa' && 'Control de calidad final.'}
                          {col.id === 'billing' && 'Generación de factura y cobro.'}
                          {col.id === 'delivery' && 'En ruta de entrega o enviado.'}
                       </TableCell>
                       <TableCell className="text-right">
                          <Link href={`/dashboard/lab/kamba/${col.id}`}>
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-[10px] border-blue-100 text-blue-600 hover:bg-blue-50"
                             >
                                Ver Detalle
                             </Button>
                          </Link>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Modal Detalles */}
      <Dialog open={activeModal === 'details'} onOpenChange={closeModals}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de Orden de Laboratorio</DialogTitle>
            <DialogDescription>
               Información completa sobre la orden #{selectedOrder?.order_number || selectedOrder?.id.slice(0,8)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
               <div className="space-y-1">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Paciente ID</p>
                  <p className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{selectedOrder.patient_id || 'ID-PENDIENTE'}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Clínica</p>
                  <p className="font-semibold">{selectedOrder.clinic_name}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Doctor</p>
                  <p>{selectedOrder.doctor_name || 'Sin asignar'}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Servicio</p>
                  <p className="font-bold text-indigo-600">{selectedOrder.product_name}</p>
               </div>
               <div className="col-span-2 space-y-1">
                  <p className="text-gray-400 font-bold uppercase text-[10px]">Notas de Requerimiento</p>
                  <div className="bg-gray-50 p-2 rounded text-[12px] italic">
                     {selectedOrder.requirement_notes || 'Sin notas adicionales.'}
                  </div>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Modal Justificación Regreso */}
      <Dialog open={activeModal === 'return'} onOpenChange={closeModals}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-500 flex items-center gap-2"><Undo2 className="h-5 w-5"/> Justificar Regreso</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
             <p className="text-sm text-gray-500">Explica por qué la orden debe volver a la etapa de <strong>{KAMBA_COLUMNS.find(c => c.id === pendingStatus)?.label}</strong>.</p>
             <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Motivo del rechazo o re-proceso..." />
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={closeModals}>Cancelar</Button>
             <Button variant="destructive" disabled={!justification.trim()} onClick={() => executeMove(justification)}>Confirmar Regreso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Modal Pausa */}
      <Dialog open={activeModal === 'pause'} onOpenChange={closeModals}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pause className="h-5 w-5"/> Solicitar Pausa de SLA</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
             <p className="text-sm text-gray-500">¿Por qué deseas pausar el tiempo de esta orden? (Requiere aprobación de Coordinación).</p>
             <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Falta de material, duda clínica, etc..." />
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={closeModals}>Cancelar</Button>
             <Button disabled={!justification.trim()} onClick={executePause}>Enviar Solicitud</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Modal Confirmación "Listo" */}
      <Dialog open={activeModal === 'confirm'} onOpenChange={closeModals}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5"/> Confirmar Avance</DialogTitle></DialogHeader>
          <div className="py-4">
             <p className="text-sm">¿Has terminado tu proceso y estás listo para enviar la orden a <strong>{KAMBA_COLUMNS.find(c => c.id === pendingStatus)?.label}</strong>?</p>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={closeModals}>Cancelar</Button>
             <Button className="bg-green-600 hover:bg-green-700" onClick={() => executeMove()}>¡Sí, Listo!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

function KambaCard({ 
  order, onForward, onBackward, onPause, onDetails 
}: { 
  order: KanbanCard, 
  onForward: () => void, 
  onBackward: () => void, 
  onPause: () => void,
  onDetails: () => void
}) {
  return (
    <Card className={`group relative border-none shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all ${
       order.is_paused ? 'bg-amber-50 opacity-80' : 
       order.priority === 'urgent' ? 'bg-red-50' : 'bg-white'
    }`}>
      <CardContent className="p-2 flex flex-col gap-1.5" onClick={onDetails}>
        {/* Header: No. Orden & Pause State */}
        <div className="flex justify-between items-start">
           <Badge variant="secondary" className="text-[9px] font-mono px-1 h-4 bg-gray-100 text-gray-600">
              {order.order_number || '#'+order.id.slice(0,4).toUpperCase()}
           </Badge>
           {order.is_paused && <Pause className="h-2.5 w-2.5 text-amber-500 animate-pulse" />}
        </div>

        {/* Info Body */}
        <div className="flex flex-col gap-0.5 leading-tight">
           <span className="text-[10px] font-extrabold text-gray-900 line-clamp-1">{order.product_name}</span>
           <span className="text-[8px] text-blue-600 font-bold truncate tracking-tight">{order.clinic_name}</span>
           <span className="text-[8px] text-gray-500 truncate italic">Dr. {order.doctor_name || '---'}</span>
        </div>

        {/* SLA / Timer Mock */}
        <div className="flex items-center gap-1 mt-1 text-[8px] text-gray-400 font-mono">
           <Clock className="h-2.5 w-2.5" />
           <span>SLA: {order.sla_hours || '48'}h / </span>
           <span className={order.priority === 'urgent' ? 'text-red-500 font-bold' : 'text-green-600'}>32h rem</span>
        </div>

        {/* Patient ID Link */}
        <div className="flex items-center gap-1 mt-1">
           <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">Patient ID:</span>
           <span className="text-[7px] font-mono text-gray-600">{order.patient_id?.slice(0,8) || 'PEND-DOC'}</span>
        </div>

        {/* Action Buttons (Visible on Hover) */}
        <div className="mt-2 grid grid-cols-2 gap-1" onClick={(e) => e.stopPropagation()}>
           <Button 
              variant="outline" 
              className="h-6 text-[8px] px-1 gap-1 text-red-600 border-red-100 hover:bg-red-50"
              onClick={onBackward}
           >
              <Undo2 className="h-2.5 w-2.5" /> Regresar
           </Button>
           <Button 
              className="h-6 text-[8px] px-1 gap-1 bg-green-600 hover:bg-green-700"
              onClick={onForward}
           >
              Listo <CheckCircle2 className="h-2.5 w-2.5" />
           </Button>
           <Button 
              variant="ghost" 
              className="col-span-2 h-5 text-[7px] text-amber-600 hover:bg-amber-100"
              onClick={onPause}
           >
              {order.is_paused ? <Play className="h-2 w-2 mr-1"/> : <Pause className="h-2 w-2 mr-1"/>}
              {order.is_paused ? 'Continuar Proc.' : 'Solicitar Pausa'}
           </Button>
        </div>

        {/* Type Icon Overlay */}
        <div className="absolute top-1 right-1 p-0.5 pointer-events-none">
           {order.is_digital ? (
             <Monitor className="h-2.5 w-2.5 text-blue-400" />
           ) : (
             <ClipboardCheck className="h-2.5 w-2.5 text-emerald-400" />
           )}
        </div>
      </CardContent>
    </Card>
  )
}
