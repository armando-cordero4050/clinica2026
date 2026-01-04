'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { createClinicStaff } from '../actions/create-staff'
import { logClientEvent } from '@/modules/core/actions/log-client'
import { toast } from 'sonner'
import { Loader2, UserPlus } from 'lucide-react'

const staffSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  jobPosition: z.string().min(1, 'Selecciona un puesto'),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
})

const CLINIC_ROLES = [
  'Odontólogo',
  'Asistente Dental', 
  'Recepcionista',
  'Administrador de Clínica',
  'Gerente',
  'Técnico Dental',
  'Higienista'
]

interface AddStaffDialogProps {
  clinicId: string
}

export function AddStaffDialog({ clinicId }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      jobPosition: '',
      phone: '',
      mobile: '',
      title: '',
      notes: ''
    }
  })

  const onSubmit = async (values: z.infer<typeof staffSchema>) => {
    console.log('🚀 [Cliente] Enviando formulario:', values)
    await logClientEvent('INTENTO DE SUBMIT', values)
    setLoading(true)
    try {
      console.log('🚀 [Cliente] Llamando a createClinicStaff...')
      await logClientEvent('LLAMANDO SERVER ACTION createClinicStaff', { clinicId })
      
      const result = await createClinicStaff({
        clinicId,
        name: values.name,
        email: values.email,
        jobPosition: values.jobPosition,
        phone: values.phone,
        mobile: values.mobile,
        title: values.title,
        notes: values.notes
      })

      if (result.success) {
        await logClientEvent('EXITO SERVER ACTION', result)
        toast.success(result.message)
        setOpen(false)
        form.reset()
      } else {
        await logClientEvent('ERROR SERVER ACTION (Return false)', result)
        toast.error(result.message)
      }
    } catch (error: any) {
      await logClientEvent('EXCEPTION SERVER ACTION', { message: error.message, stack: error.stack })
      toast.error('Error inesperado al crear staff')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 font-bold shadow-md transition-all active:scale-95">
          <UserPlus className="h-4 w-4" />
          Agregar Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Nuevo Miembro de Staff
          </DialogTitle>
          <DialogDescription>
            Crea un nuevo contacto en Odoo y sincronízalo automáticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1 */}
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-bold text-gray-700">Nombre del contacto</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Juan Pérez" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-bold text-gray-700">Título</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Dr., Sr., Sra." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="jobPosition"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-bold text-gray-700">Puesto de trabajo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ''}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {CLINIC_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                {role}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-bold text-gray-700">Correo electrónico</FormLabel>
                        <FormControl>
                            <Input placeholder="email@ejemplo.com" {...field} type="email" value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-bold text-gray-700">Teléfono</FormLabel>
                        <FormControl>
                            <Input placeholder="+502 ..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-bold text-gray-700">Móvil</FormLabel>
                        <FormControl>
                            <Input placeholder="+502 ..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700">Notas internas</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Información adicional..." 
                        className="resize-none" 
                        {...field}
                        value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="font-bold bg-blue-600 gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Sincronizando...' : 'Guardar'}
              </Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
