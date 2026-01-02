'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CalendarIcon, AlertTriangle, Loader2 } from 'lucide-react'
import { format, setHours, setMinutes } from 'date-fns'
import { toast } from 'sonner'
import { createAppointment, searchPatients, getDoctors, type Patient, type Doctor } from './actions'

interface NewAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    defaultDate?: Date
}

export function NewAppointmentModal({ isOpen, onClose, defaultDate }: NewAppointmentModalProps) {
    const router = useRouter()
    const [isNewPatient, setIsNewPatient] = useState(false)
    const [patientSearch, setPatientSearch] = useState('')
    const [newPatientName, setNewPatientName] = useState('')
    
    // Form State
    const [selectedDate, setSelectedDate] = useState<Date>(defaultDate || new Date())
    const [duration, setDuration] = useState('30')
    const [title, setTitle] = useState('')
    const [notes, setNotes] = useState('')
    const [startTimeStr, setStartTimeStr] = useState('09:00') 
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Data State
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [isSearchingPatients, setIsSearchingPatients] = useState(false)

    // Load doctors when modal opens
    useEffect(() => {
        if (isOpen) {
            getDoctors().then(docs => {
                setDoctors(docs)
                if (docs.length > 0) setSelectedDoctorId(docs[0].id)
            })
        }
    }, [isOpen])

    // Debounced patient search
    useEffect(() => {
        if (!patientSearch || patientSearch.length < 2 || isNewPatient) {
            setPatients([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearchingPatients(true)
            const results = await searchPatients(patientSearch)
            setPatients(results)
            setIsSearchingPatients(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [patientSearch, isNewPatient])


    const handleSave = async () => {
        // Validate inputs
        if (isNewPatient) {
            if (!newPatientName.trim()) {
                toast.error('Por favor ingresa el nombre del paciente')
                return
            }
            router.push(`/dashboard/medical/patients/new?name=${encodeURIComponent(newPatientName)}`)
            return
        }

        if (!selectedPatient) {
            toast.error('Por favor selecciona un paciente')
            return
        }

        if (!title.trim()) {
            toast.error('Por favor ingresa el motivo de la cita')
            return
        }

        setIsSubmitting(true)
        
        try {
            // Construct Dates
            const [hours, minutes] = startTimeStr.split(':').map(Number)
            const startDate = setMinutes(setHours(selectedDate, hours), minutes)
            const endDate = new Date(startDate.getTime() + parseInt(duration) * 60000)

            const result = await createAppointment({
                patient_id: selectedPatient.id,
                doctor_id: selectedDoctorId || undefined,
                title: title.trim(),
                start: startDate,
                end: endDate,
                appointment_type: 'consultation',
                reason: notes.trim() || undefined
            })

            if (result.success) {
                toast.success('Cita creada exitosamente')
                onClose()
                router.refresh()
            } else {
                toast.error(`Error al crear cita: ${result.message}`)
            }
        } catch (error) {
            console.error('Error creating appointment:', error)
            toast.error('Error inesperado al crear la cita')
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden bg-white gap-0">
                <DialogTitle className="sr-only">Nueva Cita</DialogTitle>
                <div className="flex flex-col h-full active:outline-none focus:outline-none">
                    {/* Header Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button className="px-6 py-4 text-sm font-semibold text-teal-600 border-b-2 border-teal-500 bg-white hover:bg-gray-50 transition-colors">
                            Crear una cita
                        </button>
                        <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                            Crear un evento
                        </button>
                        <div className="ml-auto p-2">
                             <DialogClose asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">Cerrar</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </Button>
                            </DialogClose>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-2 gap-12">
                        {/* LEFT COLUMN */}
                        <div className="space-y-6">
                            {/* Patient Selection */}
                            <div className="space-y-3">
                                <Label className="text-gray-500 font-medium ml-1">Paciente</Label>
                                {isNewPatient ? (
                                    <Input 
                                        placeholder="Nombre completo del nuevo paciente" 
                                        value={newPatientName}
                                        onChange={(e) => setNewPatientName(e.target.value)}
                                        className="h-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                    />
                                ) : (
                                    <div className="relative">
                                         <Input 
                                            placeholder="Buscar paciente" 
                                            className="h-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500 pl-4 py-2"
                                            value={selectedPatient ? selectedPatient.full_name : patientSearch}
                                            onChange={(e) => {
                                                setPatientSearch(e.target.value)
                                                setSelectedPatient(null)
                                            }}
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        
                                        {/* Patient Search Results Dropdown */}
                                        {patients.length > 0 && !selectedPatient && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                                {patients.map((patient) => (
                                                    <button
                                                        key={patient.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedPatient(patient)
                                                            setPatientSearch('')
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex flex-col"
                                                    >
                                                        <span className="font-medium text-gray-900">{patient.full_name}</span>
                                                        {(patient.email || patient.mobile) && (
                                                            <span className="text-sm text-gray-500">
                                                                {patient.email || patient.mobile}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {isSearchingPatients && (
                                            <div className="absolute right-10 top-3">
                                                <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-2 mt-2">
                                    <button 
                                        onClick={() => setIsNewPatient(!isNewPatient)}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition-colors"
                                    >
                                        <div className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${isNewPatient ? 'bg-teal-500 border-teal-500' : ''}`}>
                                            {isNewPatient && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        Crear nuevo paciente
                                    </button>
                                </div>
                            </div>

                            {/* Doctor Selection */}
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-medium ml-1">Doctor</Label>
                                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                                    <SelectTrigger className="border-gray-200 h-10 w-full text-gray-800">
                                        <SelectValue placeholder="Seleccionar Doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map(doc => (
                                            <SelectItem key={doc.id} value={doc.id}>
                                                {doc.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                             {/* Especialidad (Mock dynamic based on doctor) */}
                             <div className="space-y-2">
                                <Label className="text-gray-500 font-medium ml-1">Especialidad</Label>
                                <div className="font-normal text-gray-800 text-sm ml-1">Odontología General</div>
                            </div>


                            {/* Motivo */}
                            <div className="space-y-2">
                                <Label className="text-gray-500 font-medium ml-1">Motivo</Label> 
                                <div className="relative">
                                     <Input 
                                        placeholder="Buscar motivo (Título)" 
                                        className="h-10 border-gray-200" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                     />
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                             {/* Servicio */}
                             <div className="space-y-2">
                                <Label className="text-gray-500 font-medium ml-1">Agregar servicio <br/><span className="text-xs font-normal text-gray-400">(Opcional)</span></Label> 
                                <div className="relative">
                                     <Input placeholder="Buscar servicio" className="h-10 border-gray-200" />
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                             {/* Duración */}
                             <div className="space-y-2">
                                <Label className="text-gray-500 font-medium ml-1">Duración</Label> 
                                <Select value={duration} onValueChange={setDuration}>
                                    <SelectTrigger className="border-gray-200 h-10 text-teal-600 w-full">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">00h 15</SelectItem>
                                        <SelectItem value="30">00h 30</SelectItem>
                                        <SelectItem value="45">00h 45</SelectItem>
                                        <SelectItem value="60">01h 00</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-6">
                             {/* Date & Time */}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium ml-1">Fecha</Label>
                                    <div className="relative">
                                        <Input 
                                            type="date"
                                            value={format(selectedDate, 'yyyy-MM-dd')} 
                                            onChange={(e) => {
                                                const newDate = new Date(e.target.value)
                                                if (!isNaN(newDate.getTime())) {
                                                    setSelectedDate(newDate)
                                                }
                                            }}
                                            className="h-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-500 font-medium ml-1">Hora inicio</Label>
                                    <Input 
                                        type="time"
                                        value={startTimeStr}
                                        onChange={(e) => setStartTimeStr(e.target.value)}
                                        className="h-10 border-gray-200 text-gray-700"
                                    />
                                </div>
                             </div>

                             {/* Opcional Label */}
                             <div className="pt-2 pb-0">
                                <h3 className="font-semibold text-sm text-gray-800">Opcional</h3>
                             </div>

                             {/* Consultorio */}
                             <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                    <Label className="text-gray-500 font-medium ml-1">Consultorio</Label>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <Select>
                                    <SelectTrigger className="border-gray-200 h-10 text-gray-400 w-full font-light">
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Consultorio 1</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                             {/* Frecuencia */}
                             <div className="space-y-2">
                                <Label className="text-gray-500 font-medium ml-1">Frecuencia</Label>
                                <Select defaultValue="norepite">
                                    <SelectTrigger className="border-gray-200 h-10 w-full text-gray-600">
                                        <SelectValue placeholder="No se repite" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="norepite">No se repite</SelectItem>
                                        <SelectItem value="diario">Todos los dias</SelectItem>
                                        <SelectItem value="semanal">Cada semana</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                             {/* Nota */}
                             <div className="space-y-2">
                                <Label className="text-gray-500 font-medium ml-1">Nota de la cita</Label>
                                <Textarea 
                                    className="resize-none min-h-[100px] border-gray-200 text-gray-600 placeholder:text-gray-300 placeholder:italic font-light" 
                                    placeholder="Escribe aquí..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Warning Box */}
                            <div className="bg-amber-50 rounded-md p-3 flex items-start gap-3 border border-amber-100">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-600">
                                    <p className="italic">Te queda poco saldo para enviar recordatorios automáticos por WhatsApp.</p>
                                    <a href="#" className="text-teal-500 hover:underline font-medium not-italic">Recarga aquí</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50">
                        <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-medium">
                            Cancelar
                        </Button>
                        <Button 
                            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-8 shadow-sm"
                            onClick={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
