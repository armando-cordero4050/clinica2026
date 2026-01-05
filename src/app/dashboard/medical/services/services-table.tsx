'use client'

import { useState } from 'react'
import { Service } from '@/modules/medical/actions/services'
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

interface ServicesTableProps {
  services: Service[]
  clinicId: string
}

export function ServicesTable({ services, clinicId }: ServicesTableProps) {
  const [searchQuery, setSearchQuery] = useState('')

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
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Días</TableHead>
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
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          N/A
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active ? 'Activo' : 'Inactivo'}
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
    </>
  )
}
