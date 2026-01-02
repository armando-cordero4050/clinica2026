'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Service, setClinicServicePrice } from '@/modules/medical/actions/services'
import { Plus, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AddServiceModalProps {
  clinicId: string
  labServices: Service[]
}

export function AddServiceModal({ clinicId, labServices }: AddServiceModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [salePriceGTQ, setSalePriceGTQ] = useState('')
  const [salePriceUSD, setSalePriceUSD] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredServices = labServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    // Suggest a 30% margin by default
    const suggestedGTQ = service.cost_price_gtq * 1.3
    const suggestedUSD = service.cost_price_usd * 1.3
    setSalePriceGTQ(suggestedGTQ.toFixed(2))
    setSalePriceUSD(suggestedUSD.toFixed(2))
  }

  const handleSave = async () => {
    if (!selectedService) {
      toast.error('Selecciona un servicio')
      return
    }

    const saleGTQ = parseFloat(salePriceGTQ)
    const saleUSD = parseFloat(salePriceUSD)

    if (isNaN(saleGTQ) || saleGTQ <= 0 || isNaN(saleUSD) || saleUSD <= 0) {
      toast.error('Los precios de venta deben ser mayores a 0')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await setClinicServicePrice({
        clinic_id: clinicId,
        service_id: selectedService.id,
        cost_price_gtq: selectedService.cost_price_gtq,
        cost_price_usd: selectedService.cost_price_usd,
        sale_price_gtq: saleGTQ,
        sale_price_usd: saleUSD,
        is_available: true
      })

      if (result.success) {
        toast.success('Servicio agregado exitosamente')
        router.refresh()
        setIsOpen(false)
        setSelectedService(null)
        setSalePriceGTQ('')
        setSalePriceUSD('')
        setSearchQuery('')
      } else {
        toast.error(result.message || 'Error al agregar servicio')
      }
    } catch (error) {
      console.error('Error adding service:', error)
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Servicio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Servicio al Catálogo</DialogTitle>
        </DialogHeader>

        {!selectedService ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicio de laboratorio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Service List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredServices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron servicios
                </p>
              ) : (
                filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectService(service)}
                  >
                    <div className="flex items-center gap-4">
                      {service.image_url && (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{service.name}</h4>
                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2">
                          <span className="text-sm font-mono">
                            Costo: {formatCurrency(service.cost_price_gtq, 'GTQ')}
                          </span>
                          <span className="text-sm font-mono">
                            {formatCurrency(service.cost_price_usd, 'USD')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected Service Info */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-4">
                {selectedService.image_url && (
                  <img
                    src={selectedService.image_url}
                    alt={selectedService.name}
                    className="h-20 w-20 rounded object-cover"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-lg">{selectedService.name}</h4>
                  {selectedService.description && (
                    <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Price Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold">Configurar Precios de Venta</h3>

              {/* GTQ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Costo GTQ</Label>
                  <div className="rounded-md bg-gray-100 px-3 py-2 font-mono text-sm">
                    {formatCurrency(selectedService.cost_price_gtq, 'GTQ')}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-gtq">Precio Venta GTQ *</Label>
                  <Input
                    id="sale-gtq"
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePriceGTQ}
                    onChange={(e) => setSalePriceGTQ(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              {/* USD */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Costo USD</Label>
                  <div className="rounded-md bg-gray-100 px-3 py-2 font-mono text-sm">
                    {formatCurrency(selectedService.cost_price_usd, 'USD')}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale-usd">Precio Venta USD *</Label>
                  <Input
                    id="sale-usd"
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePriceUSD}
                    onChange={(e) => setSalePriceUSD(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Margins */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md bg-teal-50 px-3 py-2">
                  <span className="text-sm text-teal-700">Margen GTQ:</span>
                  <p className="font-mono font-semibold text-teal-700">
                    {formatCurrency(parseFloat(salePriceGTQ || '0') - selectedService.cost_price_gtq, 'GTQ')}
                  </p>
                </div>
                <div className="rounded-md bg-teal-50 px-3 py-2">
                  <span className="text-sm text-teal-700">Margen USD:</span>
                  <p className="font-mono font-semibold text-teal-700">
                    {formatCurrency(parseFloat(salePriceUSD || '0') - selectedService.cost_price_usd, 'USD')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedService(null)
                  setSalePriceGTQ('')
                  setSalePriceUSD('')
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Atrás
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {isSubmitting ? 'Guardando...' : 'Agregar Servicio'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
