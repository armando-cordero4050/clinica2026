'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Service, setClinicServicePrice, createCustomService } from '@/modules/medical/actions/services'
import { Plus, Search, PackagePlus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface AddServiceModalProps {
  clinicId: string
  labServices: Service[]
}

export function AddServiceModal({ clinicId, labServices }: AddServiceModalProps) {
  const router = useRouter()
  // 1. All Hooks at the top
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('catalog')
  
  // Catalog State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  // Shared Price State
  const [salePriceGTQ, setSalePriceGTQ] = useState('')
  const [salePriceUSD, setSalePriceUSD] = useState('')
  
  // Custom Service State
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCostGTQ, setNewCostGTQ] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. Guard/Return after hooks
  if (!mounted) {
    return (
      <Button className="bg-teal-600 hover:bg-teal-700">
        <Plus className="mr-2 h-4 w-4" />
        Agregar Servicio
      </Button>
    )
  }

  const filteredServices = labServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectService = (service: Service) => {
    setSelectedService(service)
    // Suggest a 30% margin by default
    const suggestedGTQ = service.cost_price_gtq * 1.3
    const suggestedUSD = service.cost_price_usd * 1.3 || 0
    setSalePriceGTQ(suggestedGTQ.toFixed(2))
    setSalePriceUSD(suggestedUSD.toFixed(2))
  }

  const handleSaveCatalog = async () => {
    if (!selectedService) {
      toast.error('Selecciona un servicio')
      return
    }
    const saleGTQ = parseFloat(salePriceGTQ)
    const saleUSD = parseFloat(salePriceUSD) || 0

    if (isNaN(saleGTQ) || saleGTQ <= 0) {
      toast.error('El precio venta GTQ debe ser mayor a 0')
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
        toast.success('Servicio agregado del catálogo')
        closeModal()
      } else {
        toast.error(result.message || 'Error al agregar servicio')
      }
    } catch (error) {
        console.error(error)
      toast.error('Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateCustom = async () => {
    if (!newName.trim()) {
        toast.error('El nombre es obligatorio')
        return
    }
    const saleGTQ = parseFloat(salePriceGTQ)
    const costGTQ = parseFloat(newCostGTQ) || 0

    if (isNaN(saleGTQ) || saleGTQ <= 0) {
        toast.error('El precio venta GTQ debe ser mayor a 0')
        return
    }

    setIsSubmitting(true)
    try {
        const result = await createCustomService({
            clinic_id: clinicId,
            name: newName,
            description: newDesc,
            cost_price_gtq: costGTQ,
            sale_price_gtq: saleGTQ
        })

        if (result.success) {
            toast.success('Servicio personalizado creado exitosamente')
            closeModal()
        } else {
            toast.error(result.message || 'Error al crear servicio')
        }
    } catch (error) {
        console.error(error)
        toast.error('Error inesperado')
    } finally {
        setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsOpen(false)
    router.refresh()
    // Reset states
    setSelectedService(null)
    setSalePriceGTQ('')
    setSalePriceUSD('')
    setSearchQuery('')
    setNewName('')
    setNewDesc('')
    setNewCostGTQ('')
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
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestión de Servicios</DialogTitle>
          <DialogDescription>
            Busca servicios del catálogo global o crea uno nuevo personalizado.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="catalog" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="catalog">Catálogo Global</TabsTrigger>
                <TabsTrigger value="custom">Crear Nuevo (Personalizado)</TabsTrigger>
            </TabsList>

            {/* TAB 1: CATALOG */}
            <TabsContent value="catalog" className="space-y-4 mt-4">
                {!selectedService ? (
                <div className="space-y-4">
                    <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar servicio de laboratorio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredServices.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                        No se encontraron servicios en el catálogo global.
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
                                className="h-12 w-12 rounded object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h4 className="font-semibold">{service.name}</h4>
                                <div className="flex gap-4 mt-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                    Costo: {formatCurrency(service.cost_price_gtq, 'GTQ')}
                                </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">Seleccionar</Button>
                            </div>
                        </Card>
                        ))
                    )}
                    </div>
                </div>
                ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <Card className="p-4 bg-muted/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-semibold text-lg">{selectedService.name}</h4>
                            <p className="text-sm text-muted-foreground">Configura el precio de venta para este servicio.</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedService(null)}>Cambiar</Button>
                    </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label className="text-muted-foreground">Costo (Referencia)</Label>
                        <Input disabled value={formatCurrency(selectedService.cost_price_gtq, 'GTQ')} />
                        </div>
                        <div className="space-y-2">
                        <Label>Precio Venta (GTQ)*</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={salePriceGTQ}
                            onChange={(e) => setSalePriceGTQ(e.target.value)}
                            className="font-bold text-teal-700"
                        />
                        </div>
                    </div>

                    <Button onClick={handleSaveCatalog} disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700">
                        {isSubmitting ? 'Guardando...' : 'Agregar al Menú de Servicios'}
                    </Button>
                </div>
                )}
            </TabsContent>

            {/* TAB 2: CUSTOM */}
            <TabsContent value="custom" className="space-y-4 mt-4">
                <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
                    <div className="space-y-2">
                        <Label>Nombre del Servicio*</Label>
                        <Input 
                            placeholder="Ej. Consulta Especializada, Limpieza Profunda..." 
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea 
                            placeholder="Detalles del procedimiento..." 
                            className="resize-none"
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Costo Aproximado (GTQ)</Label>
                            <Input 
                                type="number" 
                                placeholder="0.00" 
                                value={newCostGTQ}
                                onChange={e => setNewCostGTQ(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Solo para cálculo de márgenes internos.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Precio Venta al Público (GTQ)*</Label>
                            <Input 
                                type="number" 
                                placeholder="0.00" 
                                className="font-bold text-teal-700"
                                value={salePriceGTQ}
                                onChange={e => setSalePriceGTQ(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleCreateCustom} disabled={isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700">
                             {isSubmitting ? 'Creando...' : <><PackagePlus className="mr-2 h-4 w-4"/> Crear Servicio Personalizado</>}
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
