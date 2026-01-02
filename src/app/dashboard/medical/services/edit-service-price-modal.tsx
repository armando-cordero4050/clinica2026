'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ClinicServicePrice, setClinicServicePrice } from '@/modules/medical/actions/services'
import { DollarSign, TrendingUp, Save } from 'lucide-react'

interface EditServicePriceModalProps {
  service: ClinicServicePrice | null
  clinicId: string
  isOpen: boolean
  onClose: () => void
}

export function EditServicePriceModal({ service, clinicId, isOpen, onClose }: EditServicePriceModalProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [salePriceGTQ, setSalePriceGTQ] = useState('')
  const [salePriceUSD, setSalePriceUSD] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      setSalePriceGTQ(service.sale_price_gtq.toString())
      setSalePriceUSD(service.sale_price_usd.toString())
      setIsAvailable(service.is_available)
    }
  }, [service])

  if (!service) return null

  const costGTQ = service.cost_price_gtq
  const costUSD = service.cost_price_usd
  const saleGTQ = parseFloat(salePriceGTQ) || 0
  const saleUSD = parseFloat(salePriceUSD) || 0

  const marginGTQ = saleGTQ - costGTQ
  const marginUSD = saleUSD - costUSD
  const marginPercentageGTQ = costGTQ > 0 ? ((marginGTQ / costGTQ) * 100) : 0
  const marginPercentageUSD = costUSD > 0 ? ((marginUSD / costUSD) * 100) : 0

  const handleSave = async () => {
    if (saleGTQ <= 0 || saleUSD <= 0) {
      toast.error('Los precios de venta deben ser mayores a 0')
      return
    }

    if (saleGTQ < costGTQ || saleUSD < costUSD) {
      const proceed = confirm('El precio de venta es menor al costo. ¿Deseas continuar?')
      if (!proceed) return
    }

    setIsSubmitting(true)

    try {
      const result = await setClinicServicePrice({
        clinic_id: clinicId,
        service_id: service.service_id,
        cost_price_gtq: costGTQ,
        cost_price_usd: costUSD,
        sale_price_gtq: saleGTQ,
        sale_price_usd: saleUSD,
        is_available: isAvailable
      })

      if (result.success) {
        toast.success('Precio actualizado exitosamente')
        router.refresh()
        onClose()
      } else {
        toast.error(result.message || 'Error al actualizar precio')
      }
    } catch (error) {
      console.error('Error saving service price:', error)
      toast.error('Error inesperado al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number, currency: 'GTQ' | 'USD') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Configurar Precio de Venta</DialogTitle>
          <p className="text-sm text-muted-foreground">{service.service_name}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Service Image */}
          {service.service_image_url && (
            <div className="flex justify-center">
              <img
                src={service.service_image_url}
                alt={service.service_name}
                className="h-32 w-32 rounded-lg object-cover"
              />
            </div>
          )}

          {/* GTQ Section */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Precios en Quetzales (GTQ)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Costo (Odoo)</Label>
                <div className="rounded-md bg-gray-100 px-3 py-2 font-mono text-sm">
                  {formatCurrency(costGTQ, 'GTQ')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale-gtq">Precio de Venta *</Label>
                <Input
                  id="sale-gtq"
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePriceGTQ}
                  onChange={(e) => setSalePriceGTQ(e.target.value)}
                  className="font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-teal-50 px-3 py-2">
              <span className="text-sm font-medium text-teal-700">Margen:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-teal-700">
                  {formatCurrency(marginGTQ, 'GTQ')}
                </span>
                <Badge variant={marginPercentageGTQ > 20 ? 'default' : 'secondary'}>
                  {marginPercentageGTQ.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>

          {/* USD Section */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Precios en Dólares (USD)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Costo (Odoo)</Label>
                <div className="rounded-md bg-gray-100 px-3 py-2 font-mono text-sm">
                  {formatCurrency(costUSD, 'USD')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale-usd">Precio de Venta *</Label>
                <Input
                  id="sale-usd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePriceUSD}
                  onChange={(e) => setSalePriceUSD(e.target.value)}
                  className="font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-teal-50 px-3 py-2">
              <span className="text-sm font-medium text-teal-700">Margen:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-teal-700">
                  {formatCurrency(marginUSD, 'USD')}
                </span>
                <Badge variant={marginPercentageUSD > 20 ? 'default' : 'secondary'}>
                  {marginPercentageUSD.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <Label htmlFor="available" className="text-base font-medium">
                Servicio Disponible
              </Label>
              <p className="text-sm text-muted-foreground">
                ¿Ofrecer este servicio a los pacientes?
              </p>
            </div>
            <Switch
              id="available"
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar Precio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
