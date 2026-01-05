'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Service, updateService } from '@/modules/medical/actions/services'
import { Loader2 } from 'lucide-react'

interface EditServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service
  clinicId: string
}

export function EditServiceModal({ isOpen, onClose, service, clinicId }: EditServiceModalProps) {
    const router = useRouter()
    // 1. All hooks at top
    const [mounted, setMounted] = useState(false)
    const [name, setName] = useState(service.name)
    const [description, setDescription] = useState(service.description || '')
    const [cost, setCost] = useState(service.cost_price_gtq.toString())
    const [price, setPrice] = useState(service.sale_price_gtq.toString())
    const [isActive, setIsActive] = useState(service.is_active)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // 2. Guard after hooks
    if (!mounted || !isOpen) return null

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('El nombre es requerido')
            return
        }
        
        const costVal = parseFloat(cost) || 0
        const priceVal = parseFloat(price) || 0

        setIsSubmitting(true)

        try {
            const result = await updateService({
                id: service.id,
                clinic_id: clinicId,
                name: name,
                description: description,
                cost_price_gtq: costVal,
                sale_price_gtq: priceVal,
                is_active: isActive
            })

            if (result.success) {
                toast.success('Servicio actualizado')
                router.refresh()
                onClose()
            } else {
                toast.error(result.message || 'Error al actualizar')
            }
        } catch (error) {
            toast.error('Error inesperado')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Servicio</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del servicio y sus precios para esta clínica.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Costo (Interno)</Label>
                            <Input type="number" value={cost} onChange={e => setCost(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Precio Venta</Label>
                            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className="font-bold text-teal-700" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>Estado:</Label>
                        <Button 
                            variant={isActive ? "default" : "secondary"} 
                            size="sm" 
                            onClick={() => setIsActive(!isActive)}
                            className={isActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-200 text-gray-500"}
                        >
                            {isActive ? 'Activo' : 'Inactivo'}
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
