'use client'

import { useState } from 'react'
import { ClinicServicePrice } from '@/modules/medical/actions/services'
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
import { Search } from 'lucide-react'
import { EditServicePriceModal } from './edit-service-price-modal'

interface ServicesTableProps {
  services: ClinicServicePrice[]
  clinicId: string
}

export function ServicesTable({ services, clinicId }: ServicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<ClinicServicePrice | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Filter services based on search
  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.service_description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number, currency: 'GTQ' | 'USD') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const handleEditClick = (service: ClinicServicePrice) => {
    setSelectedService(service)
    setIsEditModalOpen(true)
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
                  <TableHead className="text-right">Costo (GTQ)</TableHead>
                  <TableHead className="text-right">Venta (GTQ)</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-right">Costo (USD)</TableHead>
                  <TableHead className="text-right">Venta (USD)</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Días</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {searchQuery ? 'No se encontraron servicios' : 'No hay servicios configurados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow
                      key={service.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEditClick(service)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {service.service_image_url && (
                            <img
                              src={service.service_image_url}
                              alt={service.service_name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{service.service_name}</div>
                            {service.service_description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {service.service_description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(service.cost_price_gtq, 'GTQ')}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-green-600">
                        {formatCurrency(service.sale_price_gtq, 'GTQ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={service.margin_percentage && service.margin_percentage > 20 ? 'default' : 'secondary'}
                        >
                          {service.margin_percentage?.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(service.cost_price_usd, 'USD')}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-green-600">
                        {formatCurrency(service.sale_price_usd, 'USD')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={service.is_available ? 'default' : 'secondary'}>
                          {service.is_available ? 'Disponible' : 'No disponible'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {service.turnaround_days ? `${service.turnaround_days}d` : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditServicePriceModal
        service={selectedService}
        clinicId={clinicId}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedService(null)
        }}
      />
    </>
  )
}
