'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, User, MapPin, FileText, Smartphone } from 'lucide-react'
import { createPatient, type PatientInsert } from '@/modules/medical/actions/patients'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner' // Assuming sonner is installed, based on settings page usage

export default function NewPatientDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<PatientInsert>({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    date_of_birth: '',
    gender: 'other',
    id_type: 'dpi',
    id_number: '',
    address: '',
    acquisition_source: 'walk_in'
  })

  const handleChange = (field: keyof PatientInsert, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await createPatient(formData)
      if (res.success) {
        setOpen(false)
        toast.success("Paciente creado exitosamente")
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            mobile: '',
            date_of_birth: '',
            gender: 'other',
            id_type: 'dpi',
            id_number: '',
            address: '',
            acquisition_source: 'walk_in'
        })
      } else {
        toast.error('Error: ' + res.message)
      }
    } catch (err: any) {
      toast.error('Error de sistema: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Paciente</DialogTitle>
            <DialogDescription>
              Complete la ficha de identificación esencial.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="personal" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">Datos Personales</TabsTrigger>
              <TabsTrigger value="contact">Contacto y Ubicación</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">Nombres <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="first_name" 
                                className="pl-8" 
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                required 
                                placeholder="Ej. Juan Carlos"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Apellidos <span className="text-red-500">*</span></Label>
                        <Input 
                            id="last_name" 
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                            required 
                            placeholder="Ej. Perez Lopez"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Identificación</Label>
                        <div className="flex gap-2">
                            <Select 
                                value={formData.id_type} 
                                onValueChange={(v: any) => handleChange('id_type', v)}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dpi">DPI</SelectItem>
                                    <SelectItem value="nit">NIT</SelectItem>
                                    <SelectItem value="passport">Pasaporte</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input 
                                placeholder="Número de ID"
                                value={formData.id_number}
                                onChange={(e) => handleChange('id_number', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">Fecha Nacimiento</Label>
                        <Input 
                            id="dob" 
                            type="date" 
                            value={formData.date_of_birth}
                            onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Género</Label>
                    <Select 
                        value={formData.gender} 
                        onValueChange={(v: any) => handleChange('gender', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Femenino</SelectItem>
                            <SelectItem value="other">Otro / Prefiero no decir</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Celular / WhatsApp <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Smartphone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="mobile" 
                                className="pl-8"
                                value={formData.mobile}
                                onChange={(e) => handleChange('mobile', e.target.value)}
                                required 
                                placeholder="Ej. 5555-5555"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            placeholder="paciente@ejemplo.com"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Dirección Física</Label>
                    <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="address" 
                            className="pl-8"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="Zona, Colonia, Calle..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Referido Por (Origen)</Label>
                    <Select 
                        value={formData.acquisition_source} 
                        onValueChange={(v: any) => handleChange('acquisition_source', v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="walk_in">Pasante (Walk-in)</SelectItem>
                            <SelectItem value="referral">Referido por Paciente</SelectItem>
                            <SelectItem value="social_media">Redes Sociales</SelectItem>
                            <SelectItem value="google">Google / Web</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div> : null}
                {loading ? 'Guardando...' : 'Crear Expediente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
