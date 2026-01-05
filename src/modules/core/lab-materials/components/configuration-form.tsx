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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createLabConfiguration, updateLabConfiguration, type LabConfiguration } from '../actions'

interface ConfigurationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materialId: string
  materialName: string
  configuration?: LabConfiguration | null
  onSuccess?: () => void
}

export function ConfigurationForm({ 
  open, 
  onOpenChange, 
  materialId,
  materialName,
  configuration, 
  onSuccess 
}: ConfigurationFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: configuration?.name || '',
    code: configuration?.code || '',
    odoo_product_id: configuration?.odoo_product_id || '',
    base_price: configuration?.base_price || 0,
    price_type: configuration?.price_type || 'per_unit',
    sla_days: configuration?.sla_days || 3
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (configuration?.id) {
        result = await updateLabConfiguration(configuration.id, formData)
      } else {
        result = await createLabConfiguration({
          ...formData,
          material_id: materialId
        })
      }

      if (result.success) {
        toast.success(configuration?.id ? 'Configuración actualizada' : 'Configuración creada')
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.error || 'Error al guardar configuración')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {configuration?.id ? 'Editar Configuración' : 'Nueva Configuración'}
            </DialogTitle>
            <DialogDescription>
              Material: <strong>{materialName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Alemán Estratificado (LD 004)"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Código Interno</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ej: LD004"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="odoo_product_id">Código Odoo (Opcional)</Label>
              <Input
                id="odoo_product_id"
                value={formData.odoo_product_id}
                onChange={(e) => setFormData({ ...formData, odoo_product_id: e.target.value })}
                placeholder="Ej: SVC-ZIR-EST"
              />
              <p className="text-xs text-muted-foreground">
                Código del producto en Odoo para facturación
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="base_price">
                  Precio Base (GTQ) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price_type">Tipo de Precio</Label>
                <Select
                  value={formData.price_type}
                  onValueChange={(value: 'fixed' | 'per_unit') => 
                    setFormData({ ...formData, price_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_unit">Por Unidad</SelectItem>
                    <SelectItem value="fixed">Precio Fijo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sla_days">
                SLA (Días de Entrega) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sla_days"
                type="number"
                min="1"
                max="30"
                value={formData.sla_days}
                onChange={(e) => setFormData({ ...formData, sla_days: parseInt(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Días hábiles para completar el trabajo (SLA estándar)
              </p>
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
              {loading ? 'Guardando...' : configuration?.id ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
