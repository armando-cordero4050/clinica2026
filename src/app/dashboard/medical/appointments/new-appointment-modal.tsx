'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Loader2, Search, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { 
  createAppointment, 
  createPatientWithGuardian,
  searchPatients, 
  searchGuardians,
  searchServices,
  createService,
  getDoctors,
  getCurrentDoctor,
  type Patient, 
  type Doctor,
  type Service
} from './actions'

interface NewAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    defaultDate?: Date
}

export function NewAppointmentModal({ isOpen, onClose, defaultDate }: NewAppointmentModalProps) {
    const router = useRouter()
    const [isNewPatient, setIsNewPatient] = useState(false)
    const [patientSearch, setPatientSearch] = useState('')
    
    // Patient Fields
    const [documentType, setDocumentType] = useState('DPI')
    const [hasDocument, setHasDocument] = useState(true)
    const [documentNumber, setDocumentNumber] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [mobile, setMobile] = useState('')
    const [email, setEmail] = useState('')
    
    // Guardian Fields
    const [hasGuardian, setHasGuardian] = useState(false)
    const [guardianType, setGuardianType] = useState<'new' | 'existing'>('new')
    const [guardianSearch, setGuardianSearch] = useState('')
    const [selectedGuardian, setSelectedGuardian] = useState<Patient | null>(null)
    const [guardianRelation, setGuardianRelation] = useState('Mamá')
    const [guardianFirstName, setGuardianFirstName] = useState('')
    const [guardianLastName, setGuardianLastName] = useState('')
    const [guardianMobile, setGuardianMobile] = useState('')
    const [guardianEmail, setGuardianEmail] = useState('')
    const [guardianDocumentType, setGuardianDocumentType] = useState('DPI')
    const [guardianDocumentNumber, setGuardianDocumentNumber] = useState('')
    const [guardianAddress, setGuardianAddress] = useState('')
    
    // Appointment Fields
    const [selectedDate, setSelectedDate] = useState<string>(
        defaultDate ? format(defaultDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    )
    const [duration, setDuration] = useState('30')
    const [serviceSearch, setServiceSearch] = useState('')
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [notes, setNotes] = useState('')
    const [startTimeStr, setStartTimeStr] = useState('09:00') 
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Data State
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('')
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [isSearchingPatients, setIsSearchingPatients] = useState(false)
    const [guardians, setGuardians] = useState<Patient[]>([])
    const [isSearchingGuardians, setIsSearchingGuardians] = useState(false)
    const [services, setServices] = useState<Service[]>([])
    const [isSearchingServices, setIsSearchingServices] = useState(false)
    
    // Service creation modal
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [newServiceName, setNewServiceName] = useState('')
    const [newServiceDescription, setNewServiceDescription] = useState('')
    const [newServicePrice, setNewServicePrice] = useState('')

    // Load doctors and set current doctor
    useEffect(() => {
        if (isOpen) {
            Promise.all([getDoctors(), getCurrentDoctor()]).then(([allDocs, currentDoc]) => {
                setDoctors(allDocs)
                if (currentDoc) {
                    setSelectedDoctorId(currentDoc.id)
                } else if (allDocs.length > 0) {
                    setSelectedDoctorId(allDocs[0].id)
                }
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

    // Debounced guardian search
    useEffect(() => {
        if (!guardianSearch || guardianSearch.length < 2 || guardianType !== 'existing') {
            setGuardians([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearchingGuardians(true)
            const results = await searchGuardians(guardianSearch)
            setGuardians(results)
            setIsSearchingGuardians(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [guardianSearch, guardianType])

    // Debounced service search
    useEffect(() => {
        if (!serviceSearch || serviceSearch.length < 2) {
            setServices([])
            return
        }

        const timer = setTimeout(async () => {
            setIsSearchingServices(true)
            const results = await searchServices(serviceSearch)
            setServices(results)
            setIsSearchingServices(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [serviceSearch])

    const handleCreateService = async () => {
        if (!newServiceName.trim()) {
            toast.error('Por favor ingresa el nombre del servicio')
            return
        }

        const result = await createService({
            name: newServiceName,
            description: newServiceDescription,
            price: newServicePrice ? parseFloat(newServicePrice) : undefined
        })

        if (result.success) {
            toast.success('Servicio creado exitosamente')
            setSelectedService({ id: result.id || '', name: result.name || '' })
            setServiceSearch(result.name || '')
            setShowServiceModal(false)
            setNewServiceName('')
            setNewServiceDescription('')
            setNewServicePrice('')
        } else {
            toast.error(`Error: ${result.message}`)
        }
    }

    const handleSave = async () => {
        let patientId: string | null = null

        // Create or select patient
        if (isNewPatient) {
            // Validate patient fields
            if (!firstName.trim()) {
                toast.error('Por favor ingresa el nombre del paciente')
                return
            }
            if (!lastName.trim()) {
                toast.error('Por favor ingresa el apellido del paciente')
                return
            }
            if (!mobile.trim()) {
                toast.error('Por favor ingresa el teléfono del paciente')
                return
            }

            // Validate guardian if needed
            if (hasGuardian) {
                if (guardianType === 'existing' && !selectedGuardian) {
                    toast.error('Por favor selecciona un apoderado')
                    return
                }
                if (guardianType === 'new') {
                    if (!guardianFirstName.trim()) {
                        toast.error('Por favor ingresa el nombre del apoderado')
                        return
                    }
                    if (!guardianLastName.trim()) {
                        toast.error('Por favor ingresa el apellido del apoderado')
                        return
                    }
                    if (!guardianMobile.trim()) {
                        toast.error('Por favor ingresa el teléfono del apoderado')
                        return
                    }
                }
            }

            setIsSubmitting(true)
            
            // Create patient with guardian
            const patientResult = await createPatientWithGuardian({
                document_type: hasDocument ? documentType : 'NONE',
                document_number: hasDocument ? documentNumber : undefined,
                first_name: firstName,
                last_name: lastName,
                mobile: mobile,
                email: email || undefined,
                has_guardian: hasGuardian,
                guardian_id: guardianType === 'existing' ? selectedGuardian?.id : undefined,
                guardian_relation: hasGuardian ? guardianRelation : undefined,
                guardian_document_type: guardianType === 'new' ? guardianDocumentType : undefined,
                guardian_document_number: guardianType === 'new' ? guardianDocumentNumber : undefined,
                guardian_first_name: guardianType === 'new' ? guardianFirstName : undefined,
                guardian_last_name: guardianType === 'new' ? guardianLastName : undefined,
                guardian_mobile: guardianType === 'new' ? guardianMobile : undefined,
                guardian_email: guardianType === 'new' ? guardianEmail : undefined,
                guardian_address: guardianType === 'new' ? guardianAddress : undefined
            })

            if (!patientResult.success) {
                toast.error(`Error: ${patientResult.message}`)
                setIsSubmitting(false)
                return
            }

            patientId = patientResult.id!
        } else {
            if (!selectedPatient) {
                toast.error('Por favor selecciona un paciente')
                return
            }
            patientId = selectedPatient.id
        }

        if (!selectedService) {
            toast.error('Por favor selecciona un motivo/servicio')
            setIsSubmitting(false)
            return
        }

        if (!patientId) {
            toast.error('Error: No se pudo identificar al paciente')
            setIsSubmitting(false)
            return
        }

        setIsSubmitting(true)
        
        try {
            // Construct Dates
            const [hours, minutes] = startTimeStr.split(':').map(Number)
            const dateObj = new Date(selectedDate)
            dateObj.setHours(hours, minutes, 0, 0)
            const endDate = new Date(dateObj.getTime() + parseInt(duration) * 60000)

            const result = await createAppointment({
                patient_id: patientId,
                doctor_id: selectedDoctorId || undefined,
                title: selectedService.name,
                start: dateObj,
                end: endDate,
                appointment_type: 'consultation',
                reason: notes.trim() || undefined
            })

            if (result.success) {
                toast.success(isNewPatient ? 'Paciente y cita creados exitosamente' : 'Cita creada exitosamente')
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
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden bg-white gap-0">
                    <DialogTitle className="sr-only">Nueva Cita</DialogTitle>
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Crear una cita</h2>
                            <DialogClose asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">Cerrar</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </Button>
                            </DialogClose>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <div className="p-8 grid grid-cols-2 gap-12">
                                {/* LEFT COLUMN */}
                                <div className="space-y-6">
                                    {/* Patient Selection */}
                                    <div className="space-y-3">
                                        <Label className="text-gray-500 font-medium ml-1">Paciente</Label>
                                        <div className="relative">
                                             <Input 
                                                placeholder="Buscar paciente" 
                                                className="h-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500 pl-4 py-2"
                                                value={selectedPatient ? selectedPatient.full_name : patientSearch}
                                                onChange={(e) => {
                                                    setPatientSearch(e.target.value)
                                                    setSelectedPatient(null)
                                                }}
                                                disabled={isNewPatient}
                                            />
                                            <Search className="h-4 w-4 absolute right-3 top-3 text-teal-500" />
                                            
                                            {patients.length > 0 && !selectedPatient && !isNewPatient && (
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
                                        
                                        <div className="flex items-center gap-2 mt-2">
                                            <Checkbox 
                                                id="new-patient"
                                                checked={isNewPatient}
                                                onCheckedChange={(checked) => setIsNewPatient(checked as boolean)}
                                            />
                                            <label 
                                                htmlFor="new-patient"
                                                className="text-sm text-gray-600 cursor-pointer"
                                            >
                                                Crear nuevo paciente
                                            </label>
                                        </div>

                                        {/* New Patient Form */}
                                        {isNewPatient && (
                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                {hasGuardian ? (
                                                    <Tabs defaultValue="patient" className="w-full">
                                                        <TabsList className="grid w-full grid-cols-2">
                                                            <TabsTrigger value="patient">Datos paciente</TabsTrigger>
                                                            <TabsTrigger value="guardian">Datos apoderado</TabsTrigger>
                                                        </TabsList>
                                                        
                                                        <TabsContent value="patient" className="space-y-3 mt-4">
                                                            {/* Document Type */}
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-500 font-medium ml-1">Documento*</Label>
                                                                <div className="flex gap-2">
                                                                    <Select value={documentType} onValueChange={setDocumentType} disabled={!hasDocument}>
                                                                        <SelectTrigger className="w-28 h-10">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="DPI">DPI</SelectItem>
                                                                            <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <Input 
                                                                        value={documentNumber}
                                                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                                                        disabled={!hasDocument}
                                                                        className="h-10 flex-1"
                                                                        placeholder="Número de documento"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <RadioGroup value={hasDocument ? 'has' : 'none'} onValueChange={(v: string) => setHasDocument(v === 'has')}>
                                                                        <div className="flex items-center space-x-2">
                                                                            <RadioGroupItem value="none" id="no-doc" />
                                                                            <Label htmlFor="no-doc" className="text-sm font-normal cursor-pointer">No tiene</Label>
                                                                        </div>
                                                                    </RadioGroup>
                                                                </div>
                                                            </div>

                                                            {/* Names */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-500 font-medium ml-1">Nombres*</Label>
                                                                    <Input 
                                                                        placeholder="Nombres" 
                                                                        value={firstName}
                                                                        onChange={(e) => setFirstName(e.target.value)}
                                                                        className="h-10"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-500 font-medium ml-1">Apellidos*</Label>
                                                                    <Input 
                                                                        placeholder="Apellidos" 
                                                                        value={lastName}
                                                                        onChange={(e) => setLastName(e.target.value)}
                                                                        className="h-10"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Phone */}
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-500 font-medium ml-1">Teléfono*</Label>
                                                                <div className="flex gap-2">
                                                                    <Input value="+502" disabled className="w-20 h-10 bg-gray-50 text-center" />
                                                                    <Input 
                                                                        placeholder="XXXXXXXX" 
                                                                        value={mobile}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value.replace(/\D/g, '')
                                                                            if (value.length <= 8) setMobile(value)
                                                                        }}
                                                                        className="h-10 flex-1"
                                                                        maxLength={8}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Email */}
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-500 font-medium ml-1">Email</Label>
                                                                <Input 
                                                                    type="email"
                                                                    value={email}
                                                                    onChange={(e) => setEmail(e.target.value)}
                                                                    className="h-10"
                                                                    placeholder="nombre@ejemplo.com"
                                                                />
                                                            </div>

                                                            {/* Guardian Checkbox */}
                                                            <div className="flex items-center gap-2 pt-2">
                                                                <RadioGroup value={hasGuardian ? 'yes' : 'no'} onValueChange={(v: string) => setHasGuardian(v === 'yes')}>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="yes" id="has-guardian" />
                                                                        <Label htmlFor="has-guardian" className="text-sm font-normal cursor-pointer">Tiene un apoderado</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>
                                                        </TabsContent>

                                                        <TabsContent value="guardian" className="space-y-3 mt-4">
                                                            <Tabs value={guardianType} onValueChange={(v) => setGuardianType(v as 'new' | 'existing')} className="w-full">
                                                                <TabsList className="grid w-full grid-cols-2">
                                                                    <TabsTrigger value="new">Apoderado nuevo</TabsTrigger>
                                                                    <TabsTrigger value="existing">Apoderado existente</TabsTrigger>
                                                                </TabsList>

                                                                <TabsContent value="existing" className="space-y-3 mt-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-500 font-medium ml-1">Buscar el apoderado?</Label>
                                                                        <div className="relative">
                                                                            <Input 
                                                                                placeholder="Nombre, apellido, etc. id..." 
                                                                                value={selectedGuardian ? selectedGuardian.full_name : guardianSearch}
                                                                                onChange={(e) => {
                                                                                    setGuardianSearch(e.target.value)
                                                                                    setSelectedGuardian(null)
                                                                                }}
                                                                                className="h-10"
                                                                            />
                                                                            <Search className="h-4 w-4 absolute right-3 top-3 text-teal-500" />
                                                                            
                                                                            {isSearchingGuardians && (
                                                                                <div className="absolute right-10 top-3">
                                                                                    <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {guardians.length > 0 && !selectedGuardian && (
                                                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-auto">
                                                                                    {guardians.map((guardian) => (
                                                                                        <button
                                                                                            key={guardian.id}
                                                                                            type="button"
                                                                                            onClick={() => {
                                                                                                setSelectedGuardian(guardian)
                                                                                                setGuardianSearch('')
                                                                                            }}
                                                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50"
                                                                                        >
                                                                                            <span className="font-medium text-gray-900">{guardian.full_name}</span>
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-500 font-medium ml-1">Relación con el paciente*</Label>
                                                                        <Select value={guardianRelation} onValueChange={setGuardianRelation}>
                                                                            <SelectTrigger className="h-10">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Mamá">Mamá</SelectItem>
                                                                                <SelectItem value="Papá">Papá</SelectItem>
                                                                                <SelectItem value="Hermano">Hermano</SelectItem>
                                                                                <SelectItem value="Familiar">Familiar</SelectItem>
                                                                                <SelectItem value="Otro">Otro</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </TabsContent>

                                                                <TabsContent value="new" className="space-y-3 mt-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-500 font-medium ml-1">Relación</Label>
                                                                        <Select value={guardianRelation} onValueChange={setGuardianRelation}>
                                                                            <SelectTrigger className="h-10">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Mamá">Mamá</SelectItem>
                                                                                <SelectItem value="Papá">Papá</SelectItem>
                                                                                <SelectItem value="Hermano">Hermano</SelectItem>
                                                                                <SelectItem value="Familiar">Familiar</SelectItem>
                                                                                <SelectItem value="Otro">Otro</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-500 font-medium ml-1">Email</Label>
                                                                        <Input 
                                                                            type="email"
                                                                            value={guardianEmail}
                                                                            onChange={(e) => setGuardianEmail(e.target.value)}
                                                                            className="h-10"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-500 font-medium ml-1">Documento*</Label>
                                                                        <div className="flex gap-2">
                                                                            <Select value={guardianDocumentType} onValueChange={setGuardianDocumentType}>
                                                                                <SelectTrigger className="w-24 h-10">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="DPI">DPI</SelectItem>
                                                                                    <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <Input 
                                                                                value={guardianDocumentNumber}
                                                                                onChange={(e) => setGuardianDocumentNumber(e.target.value)}
                                                                                className="h-10 flex-1"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-2">
                                                                            <Label className="text-gray-500 font-medium ml-1">Nombres*</Label>
                                                                            <Input 
                                                                                placeholder="Paterno" 
                                                                                value={guardianFirstName}
                                                                                onChange={(e) => setGuardianFirstName(e.target.value)}
                                                                                className="h-10"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label className="text-gray-500 font-medium ml-1">Apellidos*</Label>
                                                                            <Input 
                                                                                placeholder="Materno (opcional)" 
                                                                                value={guardianLastName}
                                                                                onChange={(e) => setGuardianLastName(e.target.value)}
                                                                                className="h-10"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-500 font-medium ml-1">Teléfono*</Label>
                                                                        <div className="flex gap-2">
                                                                            <Input value="+502" disabled className="w-20 h-10 bg-gray-50 text-center" />
                                                                            <Input 
                                                                                placeholder="XXXXXXXX" 
                                                                                value={guardianMobile}
                                                                                onChange={(e) => {
                                                                                    const value = e.target.value.replace(/\D/g, '')
                                                                                    if (value.length <= 8) setGuardianMobile(value)
                                                                                }}
                                                                                className="h-10 flex-1"
                                                                                maxLength={8}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label className="text-gray-500 font-medium ml-1">Dirección</Label>
                                                                        <Input 
                                                                            value={guardianAddress}
                                                                            onChange={(e) => setGuardianAddress(e.target.value)}
                                                                            className="h-10"
                                                                        />
                                                                    </div>
                                                                </TabsContent>
                                                            </Tabs>
                                                        </TabsContent>
                                                    </Tabs>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {/* Document Type */}
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-500 font-medium ml-1">Documento*</Label>
                                                            <div className="flex gap-2">
                                                                <Select value={documentType} onValueChange={setDocumentType} disabled={!hasDocument}>
                                                                    <SelectTrigger className="w-28 h-10">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="DPI">DPI</SelectItem>
                                                                        <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Input 
                                                                    value={documentNumber}
                                                                    onChange={(e) => setDocumentNumber(e.target.value)}
                                                                    disabled={!hasDocument}
                                                                    className="h-10 flex-1"
                                                                    placeholder="Número de documento"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <RadioGroup value={hasDocument ? 'has' : 'none'} onValueChange={(v: string) => setHasDocument(v === 'has')}>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="none" id="no-doc-simple" />
                                                                        <Label htmlFor="no-doc-simple" className="text-sm font-normal cursor-pointer">No tiene</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>
                                                        </div>

                                                        {/* Names */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-500 font-medium ml-1">Nombres*</Label>
                                                                <Input 
                                                                    placeholder="Nombres" 
                                                                    value={firstName}
                                                                    onChange={(e) => setFirstName(e.target.value)}
                                                                    className="h-10"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-500 font-medium ml-1">Apellidos*</Label>
                                                                <Input 
                                                                    placeholder="Apellidos" 
                                                                    value={lastName}
                                                                    onChange={(e) => setLastName(e.target.value)}
                                                                    className="h-10"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Phone */}
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-500 font-medium ml-1">Teléfono*</Label>
                                                            <div className="flex gap-2">
                                                                <Input value="+502" disabled className="w-20 h-10 bg-gray-50 text-center" />
                                                                <Input 
                                                                    placeholder="XXXXXXXX" 
                                                                    value={mobile}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/\D/g, '')
                                                                        if (value.length <= 8) setMobile(value)
                                                                    }}
                                                                    className="h-10 flex-1"
                                                                    maxLength={8}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Email */}
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-500 font-medium ml-1">Email</Label>
                                                            <Input 
                                                                type="email"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                className="h-10"
                                                                placeholder="nombre@ejemplo.com"
                                                            />
                                                        </div>

                                                        {/* Guardian Checkbox */}
                                                        <div className="flex items-center gap-2 pt-2">
                                                            <RadioGroup value={hasGuardian ? 'yes' : 'no'} onValueChange={(v: string) => setHasGuardian(v === 'yes')}>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="yes" id="has-guardian-simple" />
                                                                    <Label htmlFor="has-guardian-simple" className="text-sm font-normal cursor-pointer">Tiene un apoderado</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

                                     {/* Especialidad */}
                                     <div className="space-y-2">
                                        <Label className="text-gray-500 font-medium ml-1">Especialidad</Label>
                                        <div className="font-normal text-gray-800 text-sm ml-1">Odontología General</div>
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
                                            <Input 
                                                type="date"
                                                value={selectedDate} 
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="h-10 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                            />
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

                                    {/* Motivo (Service) */}
                                    <div className="space-y-2">
                                        <Label className="text-gray-500 font-medium ml-1">Motivo</Label> 
                                        <div className="relative">
                                             <Input 
                                                placeholder="Buscar servicio" 
                                                className="h-10 border-gray-200" 
                                                value={selectedService ? selectedService.name : serviceSearch}
                                                onChange={(e) => {
                                                    setServiceSearch(e.target.value)
                                                    setSelectedService(null)
                                                }}
                                             />
                                             <Search className="h-4 w-4 absolute right-3 top-3 text-teal-500" />
                                             
                                             {services.length > 0 && !selectedService && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                                                    {services.map((service) => (
                                                        <button
                                                            key={service.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedService(service)
                                                                setServiceSearch('')
                                                            }}
                                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex flex-col"
                                                        >
                                                            <span className="font-medium text-gray-900">{service.name}</span>
                                                            {service.description && (
                                                                <span className="text-sm text-gray-500">{service.description}</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowServiceModal(true)}
                                                        className="w-full px-4 py-2 text-left hover:bg-teal-50 flex items-center gap-2 border-t border-gray-100 text-teal-600"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        <span className="font-medium">Crear nuevo servicio</span>
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {isSearchingServices && (
                                                <div className="absolute right-10 top-3">
                                                    <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                     {/* Opcional Label */}
                                     <div className="pt-2 pb-0">
                                        <h3 className="font-semibold text-sm text-gray-800">Opcional</h3>
                                     </div>

                                     {/* Consultorio */}
                                     <div className="space-y-2">
                                        <Label className="text-gray-500 font-medium ml-1">Consultorio</Label>
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
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Service Creation Modal */}
            <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogTitle>Crear Nuevo Servicio</DialogTitle>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre del servicio*</Label>
                            <Input 
                                value={newServiceName}
                                onChange={(e) => setNewServiceName(e.target.value)}
                                placeholder="Ej: Limpieza dental"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea 
                                value={newServiceDescription}
                                onChange={(e) => setNewServiceDescription(e.target.value)}
                                placeholder="Descripción opcional del servicio"
                                className="resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Precio (Q)</Label>
                            <Input 
                                type="number"
                                value={newServicePrice}
                                onChange={(e) => setNewServicePrice(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowServiceModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateService} className="bg-teal-600 hover:bg-teal-700">
                            Crear Servicio
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
