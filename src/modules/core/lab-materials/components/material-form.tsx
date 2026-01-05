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
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createLabMaterial, updateLabMaterial, type LabMaterial } from '../actions'

interface MaterialFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  material?: LabMaterial | null
  onSuccess?: () => void
}

export function MaterialForm({ open, onOpenChange, material, onSuccess }: MaterialFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: material?.name || '',
    description: material?.description || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (material?.id) {
        result = await updateLabMaterial(material.id, formData)
      } else {
        result = await createLabMaterial(formData)
      }

      if (result.success) {
        toast.success(material?.id ? 'Material actualizado' : 'Material creado')
        onOpenChange(false)
        onSuccess?.()
        setFormData({ name: '', description: '' })
      } else {
        toast.error(result.error || 'Error al guardar material')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {material?.id ? 'Editar Material' : 'Nuevo Material'}
            </DialogTitle>
            <DialogDescription>
              {material?.id 
                ? 'Actualiza la información del material de laboratorio.'
                : 'Crea un nuevo material de laboratorio (ej: Zirconio, E-MAX).'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Zirconio"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del material..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : material?.id ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
