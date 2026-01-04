
import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Truck, Calendar, Package, Upload, FileText, X } from 'lucide-react'
import { addDays, format } from 'date-fns'

interface OrderItem {
    id: string
    toothNumber: number
    treatment: string
    sla_days: number
    orderId?: string
}

interface OrderModalProps {
    isOpen: boolean
    onClose: () => void
    items: OrderItem[]
    onConfirm: (orderData: any) => void
    isEditing?: boolean
}

const COURIERS = [
    { id: 'guatex', name: 'Guatex' },
    { id: 'cargo_expreso', name: 'Cargo Expreso' },
    { id: 'uber_flash', name: 'Uber Flash' },
    { id: 'mensajero', name: 'Mensajero Propio' },
]

type DeliveryType = 'digital' | 'pickup' | 'shipping'

export function OrderModal({ isOpen, onClose, items, onConfirm, isEditing = false }: OrderModalProps) {
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
    const [courier, setCourier] = useState('')
    const [tracking, setTracking] = useState('')
    const [note, setNote] = useState('')
    const [digitalFiles, setDigitalFiles] = useState<File[]>([])

    // Calculate SLA automatically (INDISCUTIBLE)
    const estimatedDate = useMemo(() => {
        if (items.length > 0) {
            const maxSla = Math.max(...items.map(i => i.sla_days || 2)) // Default 2 days if not set
            return addDays(new Date(), maxSla)
        }
        return addDays(new Date(), 2)
    }, [items])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDigitalFiles(Array.from(e.target.files))
        }
    }

    const removeFile = (index: number) => {
        setDigitalFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleConfirm = () => {
        console.log('🟢 OrderModal handleConfirm called')
        const orderData = {
            items: items.map(i => i.id),
            delivery_type: deliveryType,
            digital_files: digitalFiles, // Will be uploaded in the action
            shipping_info: deliveryType === 'shipping' ? {
                courier,
                tracking_number: tracking
            } : null,
            notes: note,
            estimated_delivery: estimatedDate
        }
        console.log('🟢 OrderModal calling onConfirm with:', orderData)
        onConfirm(orderData)
        console.log('🟢 OrderModal onConfirm called successfully')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Pedido de Laboratorio' : 'Generar Pedido de Laboratorio'}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Items Summary */}
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                        <Label className="text-xs text-gray-500 font-semibold uppercase mb-2 block">
                            Items en la orden ({items.length})
                        </Label>
                        <div className="space-y-1">
                            {items.map(item => (
                                <div key={item.id} className="text-sm flex items-center justify-between">
                                    <span className="font-medium text-slate-700">Diente {item.toothNumber}</span>
                                    <span className="text-slate-500 ml-2 truncate">{item.treatment}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Tipo de Entrega</Label>
                        <RadioGroup value={deliveryType} onValueChange={(value) => setDeliveryType(value as DeliveryType)}>
                            {/* Digital */}
                            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="digital" id="digital" className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor="digital" className="cursor-pointer font-medium">
                                        📱 Digital (Archivos)
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Adjunta archivos STL, PLY o PDF. La orden irá directo a diseño.
                                    </p>
                                </div>
                            </div>

                            {/* Pickup */}
                            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor="pickup" className="cursor-pointer font-medium">
                                        🚚 Recolección (Logística)
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Nuestro mensajero recogerá las muestras en tu clínica.
                                    </p>
                                </div>
                            </div>

                            {/* Shipping */}
                            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                                <RadioGroupItem value="shipping" id="shipping" className="mt-1" />
                                <div className="flex-1">
                                    <Label htmlFor="shipping" className="cursor-pointer font-medium">
                                        📦 Envío (Mensajería Externa)
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Enviarás las muestras por tu cuenta. Ingresa el No. de guía.
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Digital Files Upload */}
                    {deliveryType === 'digital' && (
                        <div className="space-y-3 animate-in fade-in-50">
                            <Label>Archivos Digitales</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                    <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        Click para adjuntar archivos
                                    </span>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept=".stl,.ply,.pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                    STL, PLY, PDF, JPG, PNG (máx. 50MB por archivo)
                                </p>
                            </div>

                            {/* File List */}
                            {digitalFiles.length > 0 && (
                                <div className="space-y-2">
                                    {digitalFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm font-medium">{file.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shipping Info */}
                    {deliveryType === 'shipping' && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <div className="space-y-2">
                                <Label>Empresa de Mensajería</Label>
                                <Select value={courier} onValueChange={setCourier}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar empresa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURIERS.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Número de Guía *</Label>
                                <div className="relative">
                                    <Truck className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input 
                                        className="pl-9" 
                                        placeholder="Ej. 12345678" 
                                        value={tracking}
                                        onChange={(e) => setTracking(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* SLA Estimate (Auto-calculated, NOT editable) */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                        <Calendar className="h-5 w-5" />
                        <div>
                            <p className="text-xs font-bold uppercase">Fecha de Entrega (Calculada Automáticamente)</p>
                            <p className="font-medium">{format(estimatedDate, 'dd/MM/yyyy HH:mm')}</p>
                            <p className="text-xs opacity-75 mt-1">
                                Basado en SLA de {Math.max(...items.map(i => i.sla_days || 2))} días
                            </p>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Notas o Instrucciones Especiales</Label>
                        <Textarea 
                            placeholder="Colorimetría, detalles específicos..." 
                            className="resize-none h-20"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button 
                        onClick={handleConfirm} 
                        className="bg-teal-600 hover:bg-teal-700"
                        disabled={deliveryType === 'shipping' && !tracking}
                    >
                        <Package className="w-4 h-4 mr-2" />
                        {isEditing ? 'Guardar Cambios' : 'Confirmar Pedido'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
