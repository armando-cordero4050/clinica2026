
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Truck, Calendar, MapPin, Package } from 'lucide-react'
import { addDays, format } from 'date-fns'

interface OrderItem {
    id: string
    toothNumber: number
    treatment: string
    sla_days: number
}

interface OrderModalProps {
    isOpen: boolean
    onClose: () => void
    items: OrderItem[]
    onConfirm: (orderData: any) => void
}

const COURIERS = [
    { id: 'guatex', name: 'Guatex' },
    { id: 'cargo_expreso', name: 'Cargo Expreso' },
    { id: 'uber_flash', name: 'Uber Flash' },
    { id: 'mensajero', name: 'Mensajero Propio' },
]

export function OrderModal({ isOpen, onClose, items, onConfirm }: OrderModalProps) {
    const [isDigital, setIsDigital] = useState(false)
    const [courier, setCourier] = useState('')
    const [tracking, setTracking] = useState('')
    const [address, setAddress] = useState('Clínica Sonrisas, Av. Reforma 123 - Lab Main') // Mock default
    const [note, setNote] = useState('')
    const estimatedDate = useMemo(() => {
        if (items.length > 0) {
            const maxSla = Math.max(...items.map(i => i.sla_days || 0))
            return addDays(new Date(), maxSla + 1)
        }
        return new Date()
    }, [items])

    const handleConfirm = () => {
        const orderData = {
            items: items.map(i => i.id),
            is_digital: isDigital,
            delivery_info: isDigital ? {} : {
                type: 'pickup',
                courier,
                tracking,
                address
            },
            notes: note,
            estimated_delivery: estimatedDate
        }
        onConfirm(orderData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Generar Pedido de Laboratorio</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Items Summary */}
                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                        <Label className="text-xs text-gray-500 font-semibold uppercase mb-2 block">Items en la orden ({items.length})</Label>
                        <div className="space-y-1">
                            {items.map(item => (
                                <div key={item.id} className="text-sm fle items-center justify-between">
                                    <span className="font-medium text-slate-700">Diente {item.toothNumber}</span>
                                    <span className="text-slate-500 ml-2 truncate">{item.treatment}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Digital / Physical Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Pedido Digital</Label>
                            <p className="text-xs text-gray-500">
                                {isDigital ? 'Envío de archivos STL/DICOM' : 'Recolección física de muestras'}
                            </p>
                        </div>
                        <Switch
                            checked={isDigital}
                            onCheckedChange={setIsDigital}
                        />
                    </div>

                    {!isDigital && (
                        <div className="space-y-4 animate-in fade-in-50 zoom-in-95">
                            <div className="space-y-2">
                                <Label>Método de Recolección / Envío</Label>
                                <Select value={courier} onValueChange={setCourier}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar mensajería" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COURIERS.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Número de Guía / Tracking (Opcional)</Label>
                                <div className="relative">
                                    <Truck className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input 
                                        className="pl-9" 
                                        placeholder="Ej. 12345678" 
                                        value={tracking}
                                        onChange={(e) => setTracking(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Dirección de Recolección</Label>
                                <div className="relative">
                                     <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                     <Input 
                                        className="pl-9" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* SLA Estimate */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                        <Calendar className="h-5 w-5" />
                        <div>
                            <p className="text-xs font-bold uppercase">Estimado de Entrega</p>
                            <p className="font-medium">{format(estimatedDate, 'dd/MM/yyyy')}</p>
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
                    <Button onClick={handleConfirm} className="bg-teal-600 hover:bg-teal-700">
                        <Package className="w-4 h-4 mr-2" />
                        Confirmar Pedido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
