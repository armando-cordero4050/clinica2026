import { getClinicsWithPatientCount, getAdminGlobalStats } from '@/modules/core/actions/clinics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Building2, MapPin, ShoppingBasket, Stethoscope, Mail, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function AdminClinicsPage() {
    const [clinics, stats] = await Promise.all([
        getClinicsWithPatientCount(),
        getAdminGlobalStats()
    ])

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                     <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Clínicas</h1>
                     <p className="text-gray-500 mt-2">Monitoreo en tiempo real de instancias activas</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/admin/clinics/services">
                        <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm transition-all hover:scale-105">
                            <Stethoscope className="h-4 w-4" />
                            Servicios de Clínica
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Global Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-gradient-to-br from-teal-500 to-emerald-600 text-white transform transition-all hover:scale-105">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Clínicas Activas</p>
                                <h3 className="text-4xl font-bold mt-1">{stats.clinics}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Building2 className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-teal-100 text-[10px] mt-4 italic">Total de negocios registrados en la plataforma</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white transform transition-all hover:scale-105">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Pacientes Totales</p>
                                <h3 className="text-4xl font-bold mt-1">{stats.patients}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-blue-100 text-[10px] mt-4 italic">Base de datos unificada de pacientes</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-purple-500 to-pink-600 text-white transform transition-all hover:scale-105">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-purple-100 text-xs font-bold uppercase tracking-wider">Órdenes a Lab</p>
                                <h3 className="text-4xl font-bold mt-1">{stats.orders}</h3>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <ShoppingBasket className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="text-purple-100 text-[10px] mt-4 italic">Flujo total de producción laboratorio</p>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Activity className="h-5 w-5 text-teal-600" />
                    Listado de Instancias
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinics.map((clinic: any) => (
                        <Link key={clinic.id} href={`/dashboard/medical/clinics/${clinic.id}`}>
                            <Card className="hover:shadow-lg transition-all border-none bg-white rounded-2xl overflow-hidden group">
                                <div className="h-1.5 bg-teal-500 group-hover:h-3 transition-all" />
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-bold text-gray-800 break-words group-hover:text-teal-600 transition-colors">
                                            {clinic.name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                            <Building2 className="h-3 w-3" />
                                            <span>Odoo ID: {clinic.odoo_partner_id || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <Badge variant={clinic.is_active ? 'default' : 'secondary'} className={clinic.is_active ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' : ''}>
                                        {clinic.is_active ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-4 pb-6">
                                    {/* Contact Section */}
                                    <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-teal-50/30 transition-colors">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <User className="h-3.5 w-3.5 text-teal-600" />
                                            </div>
                                            <span className="font-semibold text-gray-700">{clinic.contact_name || 'Sin contacto'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 px-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{clinic.email || 'No especificado'}</span>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <Users className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">Pacientes</span>
                                        </div>
                                        <span className="text-2xl font-black text-teal-700 tabular-nums">
                                            {clinic.patientCount}
                                        </span>
                                    </div>

                                    {/* Footer Section */}
                                    <div className="space-y-3 pt-4 border-t border-dashed border-gray-200">
                                        {clinic.address && (
                                            <div className="flex items-start gap-2 text-xs text-gray-500">
                                                <MapPin className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                                                <span className="line-clamp-1">{clinic.address}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between text-[10px] font-bold">
                                            <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                                                <Clock className="h-3 w-3" />
                                                <span className="uppercase">
                                                    Última sesión: {clinic.last_login ? formatDistanceToNow(new Date(clinic.last_login), { locale: es, addSuffix: true }) : 'Nunca'}
                                                </span>
                                            </div>
                                            <span className="text-gray-300 font-mono">ID: {clinic.id.split('-')[0]}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {clinics.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Building2 className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No hay clínicas registradas</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">Sincroniza tus contactos desde el panel de Odoo para comenzar.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
