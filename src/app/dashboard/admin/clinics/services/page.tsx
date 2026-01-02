import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Stethoscope, Building2, DollarSign, Tag, Search, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminClinicServicesPage() {
    const supabase = await createClient()

    // Fetch clinical services joined with clinics
    // Note: We access schema_medical.clinic_service_prices
    const { data: services, error } = await supabase
        .from('clinic_service_prices')
        .select(`
            *,
            clinics:clinic_id (
                id,
                name
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="p-8 text-red-600 bg-red-50 rounded-lg flex items-center gap-3">
                <Search className="h-6 w-6" />
                Error al cargar servicios clínicos: {error.message}
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/clinics">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Servicios de Clínica</h1>
                        <p className="text-gray-500 mt-1">Listado global de servicios configurados por cada instancia</p>
                    </div>
                </div>
                <Badge className="bg-indigo-600 px-3 py-1 text-sm font-bold">
                    Catálogo Unificado
                </Badge>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b">
                   <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">
                            Detalles de Servicios y Precios
                        </CardTitle>
                        <div className="text-[10px] bg-white px-2 py-1 rounded border font-mono">
                           TOTAL: {services?.length || 0} ITEMS
                        </div>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/30">
                                <TableHead className="font-bold">Servicio / Nombre</TableHead>
                                <TableHead className="font-bold">Clínica</TableHead>
                                <TableHead className="font-bold text-center">Categoría</TableHead>
                                <TableHead className="font-bold text-right">Precio</TableHead>
                                <TableHead className="font-bold text-right">Creado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-gray-400">
                                        <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium italic">No se han registrado servicios clínicos especializados.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                services?.map((service: any) => (
                                    <TableRow key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                    <Stethoscope className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{service.service_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono italic">#{service.id.slice(0,8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Building2 className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium text-blue-600">
                                                    {service.clinics?.name || 'Clínica Desconocida'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
                                                {service.category || 'General'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end font-bold text-green-600">
                                                <DollarSign className="h-3 w-3" />
                                                <span>{service.price?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-[11px] text-gray-400 font-mono">
                                            {new Date(service.created_at).toLocaleDateString()}
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
