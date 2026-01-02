
import { getAdminServices } from '@/modules/admin/actions/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, RefreshCw } from 'lucide-react'
import { SyncServicesButton } from './sync-button'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
    const services = await getAdminServices()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
                     <p className="text-gray-500 mt-2">Gestiona el catálogo maestro sincronizado con Odoo</p>
                </div>
                <SyncServicesButton />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Servicios Activos ({services.length})
                    </CardTitle>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        <RefreshCw className="h-3 w-3 mr-1" /> Sincronizado
                    </Badge>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Precio Base</TableHead>
                                <TableHead className="text-center">SLA Estimado</TableHead>
                                <TableHead className="text-right">Odoo Ref</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                                        No hay servicios registrados. Sincroniza con Odoo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                services.map((svc: any) => (
                                    <TableRow key={svc.id}>
                                        <TableCell className="font-mono text-xs text-gray-500">{svc.code}</TableCell>
                                        <TableCell className="font-medium">{svc.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {svc.category || 'General'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            Q {svc.base_price?.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-gray-700">
                                            {svc.turnaround_days ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                                    {svc.turnaround_days} Días
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-gray-400 font-mono">
                                            {svc.odoo_id || 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
