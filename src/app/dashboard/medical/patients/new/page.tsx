
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createPatient } from '@/modules/medical/actions/patients'
import { ArrowLeft, Save } from 'lucide-react'

import { Suspense } from 'react'

function NewPatientPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialName = searchParams.get('name') || ''
    
    // Split initial name logic
    const parts = initialName.trim().split(' ')
    const initialFirst = parts[0] || ''
    const initialLast = parts.slice(1).join(' ') || ''

    const [isLoading, setIsLoading] = useState(false)
    // const { toast } = useToast() <- Access removed

    const [formData, setFormData] = useState({
        first_name: initialFirst,
        last_name: initialLast,
        id_type: 'dpi',
        id_number: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'male',
        address: ''
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await createPatient({
                first_name: formData.first_name,
                last_name: formData.last_name,
                id_type: formData.id_type as any,
                id_number: formData.id_number,
                email: formData.email,
                phone: formData.phone,
                date_of_birth: formData.date_of_birth || undefined,
                gender: formData.gender as any,
                address: formData.address
            })

            if (result.success) {
                toast.success("Paciente creado exitosamente")
                // Redirect to detail
                router.push(`/dashboard/medical/patients/${result.data.id}`)
            } else {
                toast.error(result.message || "Error al crear paciente")
            }
        } catch (error) {
            console.error(error)
             toast.error("Error inesperado al procesar la solicitud")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="h-8 w-8 p-0 text-gray-400">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                     <h1 className="text-2xl font-bold text-gray-800">Nuevo Paciente</h1>
                     <p className="text-sm text-gray-500">Ingrese los datos básicos para crear el expediente (Modo Página)</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                {/* Datos Personales */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-teal-700 border-b border-gray-100 pb-2">Información Personal</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Nombres <span className="text-red-500">*</span></Label>
                            <Input 
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                placeholder="Ej: Juan Carlos"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                             <Label>Apellidos <span className="text-red-500">*</span></Label>
                             <Input 
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                placeholder="Ej: Pérez García"
                                required
                             />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                            <Label>Tipo ID</Label>
                            <Select 
                                value={formData.id_type} 
                                onValueChange={(val) => handleChange('id_type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dpi">DPI / CUI</SelectItem>
                                    <SelectItem value="passport">Pasaporte</SelectItem>
                                    <SelectItem value="nit">NIT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Número ID</Label>
                            <Input 
                                value={formData.id_number}
                                onChange={(e) => handleChange('id_number', e.target.value)}
                                placeholder="#### ##### ####"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Fecha de Nacimiento</Label>
                            <Input 
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Género</Label>
                            <Select 
                                value={formData.gender} 
                                onValueChange={(val) => handleChange('gender', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Masculino</SelectItem>
                                    <SelectItem value="female">Femenino</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* Contacto */}
                <section className="space-y-4">
                     <h3 className="text-lg font-semibold text-teal-700 border-b border-gray-100 pb-2">Contacto</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="juan@ejemplo.com"
                            />
                        </div>
                        <div className="space-y-2">
                             <Label>Teléfono / Celular</Label>
                             <Input 
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="+502 0000 0000"
                             />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label>Dirección</Label>
                        <Input 
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="Zona, Ciudad..."
                        />
                     </div>
                </section>

                <div className="flex justify-end pt-4">
                    <Button 
                        type="submit" 
                        className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto"
                        disabled={isLoading}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Registrando...' : 'Registrar Paciente'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default function NewPatientPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando formulario...</div>}>
            <NewPatientPageContent />
        </Suspense>
    )
}
