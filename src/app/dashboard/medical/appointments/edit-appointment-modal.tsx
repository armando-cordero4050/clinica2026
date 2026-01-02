'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Appointment, updateAppointmentStatus } from './actions'
import { AlertTriangle, Calendar, Clock, User, FileText, X } from 'lucide-react'

interface EditAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    appointment: Appointment | null
}

export function EditAppointmentModal({ isOpen, onClose, appointment }: EditAppointmentModalProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!appointment) return null

    const handleCancel = async () => {
        if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return

        setIsSubmitting(true)
        try {
            await updateAppointmentStatus(appointment.id, 'cancelled')
            toast.success('Cita cancelada exitosamente')
            onClose()
            router.refresh()
        } catch (error) {
            console.error('Error canceling appointment:', error)
            toast.error('Error al cancelar la cita')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleConfirm = async () => {
        setIsSubmitting(true)
        try {
            await updateAppointmentStatus(appointment.id, 'confirmed')
            toast.success('Cita confirmada exitosamente')
            onClose()
            router.refresh()
        } catch (error) {
            console.error('Error confirming appointment:', error)
            toast.error('Error al confirmar la cita')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleComplete = async () => {
        setIsSubmitting(true)
        try {
            await updateAppointmentStatus(appointment.id, 'completed')
            toast.success('Cita completada exitosamente')
            onClose()
            router.refresh()
        } catch (error) {
            console.error('Error completing appointment:', error)
            toast.error('Error al completar la cita')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEdit = () => {
        // TODO: Implement edit functionality
        toast.info('Función de edición en desarrollo')
    }

    const startDate = new Date(appointment.start_time)
    const endDate = new Date(appointment.end_time)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white">
                <DialogTitle className="sr-only">Detalles de la Cita</DialogTitle>
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{appointment.patient_name}</h2>
                            <p className="text-blue-100 text-sm">{appointment.title}</p>
                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                                <X className="h-5 w-5" />
                            </Button>
                        </DialogClose>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {appointment.status === 'scheduled' ? 'Programada' :
                             appointment.status === 'confirmed' ? 'Confirmada' :
                             appointment.status === 'cancelled' ? 'Cancelada' :
                             appointment.status}
                        </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-500 text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Fecha
                            </Label>
                            <p className="font-medium">{format(startDate, 'dd/MM/yyyy')}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-500 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Hora
                            </Label>
                            <p className="font-medium">
                                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-500 text-sm flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Doctor
                            </Label>
                            <p className="font-medium">{appointment.doctor_name || 'No asignado'}</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-500 text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Tipo
                            </Label>
                            <p className="font-medium capitalize">{appointment.status}</p>
                        </div>
                    </div>

                    {/* Notes (if any) */}
                    {appointment.title && (
                        <div className="space-y-2">
                            <Label className="text-gray-500 text-sm">Motivo</Label>
                            <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700">{appointment.title}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 p-4 flex justify-between gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={handleCancel}
                        disabled={isSubmitting || appointment.status === 'cancelled' || appointment.status === 'completed'}
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Cancelar
                    </Button>
                    
                    {appointment.status === 'scheduled' && (
                        <Button
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                        >
                            Confirmar
                        </Button>
                    )}

                    {appointment.status === 'confirmed' && (
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleComplete}
                            disabled={isSubmitting}
                        >
                            Completar
                        </Button>
                    )}

                    {appointment.status === 'completed' && (
                        <Button
                            className="flex-1 bg-gray-400 text-white cursor-not-allowed"
                            disabled
                        >
                            Completada
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
