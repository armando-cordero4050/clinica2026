'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Service, deleteService } from '@/modules/medical/actions/services'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Pencil, Trash2, Loader2 } from 'lucide-react'
import { EditServiceModal } from './edit-service-modal'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ServicesTableProps {
  services: Service[]
  clinicId: string
}

export function ServicesTable({ services, clinicId }: ServicesTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter services based on search
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number, currency: 'GTQ' | 'USD') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
        const result = await deleteService(deleteId, clinicId)
        if (result.success) {
            toast.success('Servicio eliminado (archivado)')
            setDeleteId(null)
            router.refresh()
        } else {
            toast.error(result.message || 'Error al eliminar')
        }
    } catch (error) {
        toast.error('Error inesperado')
    } finally {
        setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catálogo de Servicios</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead className="text-right">Venta (GTQ)</TableHead>
                  <TableHead className="text-right">Costo (Int.)</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchQuery ? 'No se encontraron servicios' : 'No hay servicios configurados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow
                      key={service.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {service.image_url && (
                            <img
                              src={service.image_url}
                              alt={service.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {service.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-green-600">
                        {formatCurrency(service.sale_price_gtq, 'GTQ')}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {service.cost_price_gtq > 0 ? formatCurrency(service.cost_price_gtq, 'GTQ') : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="icon" onClick={() => setEditingService(service)}>
                                <Pencil className="h-4 w-4 text-blue-500" />
                             </Button>
                             <Button variant="ghost" size="icon" onClick={() => setDeleteId(service.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                             </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingService && (
        <EditServiceModal 
            isOpen={!!editingService} 
            onClose={() => setEditingService(null)} 
            service={editingService}
            clinicId={clinicId}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción archivará el servicio. Ya no estará disponible para nuevas citas.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={(e) => { e.preventDefault(); handleDelete() }} 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Sí, eliminar'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
