import { getClinicDetails } from '@/modules/medical/actions/clinics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  ArrowLeft,
  Info,
  Users,
  Package,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { ClinicInfoTab } from '@/modules/medical/components/clinic-info-tab'
import { ClinicStaffTab } from '@/modules/medical/components/clinic-staff-tab'
import { ClinicOrdersTab } from '@/modules/medical/components/clinic-orders-tab'
import { ClinicPaymentsTab } from '@/modules/medical/components/clinic-payments-tab'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

export default async function ClinicDetailPage({ params }: PageProps) {
  const { id } = await params
  const clinicData = await getClinicDetails(id)

  if (!clinicData) {
    notFound()
  }

  const clinic = clinicData.clinic
  const staff = clinicData.staff || []
  const stats = clinicData.stats || { ordersCount: 0, patientsCount: 0, totalPayments: 0 }

  return (
    <div className="space-y-6 container max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/clinics">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">{clinic.name}</h1>
            <p className="text-muted-foreground italic text-sm">
              {clinic.city}, {clinic.country}
            </p>
          </div>
        </div>
        <Badge className={clinic.is_active ? 'bg-green-600' : 'bg-gray-400'}>
          {clinic.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Staff Total</p>
                <p className="text-2xl font-bold text-indigo-600">{staff.length}</p>
              </div>
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Pacientes</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.patientsCount}</p>
              </div>
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Órdenes</p>
                <p className="text-2xl font-bold text-green-600">{stats.ordersCount}</p>
              </div>
              <Package className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Pagos Totales</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalPayments.toFixed(2)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full" id="clinic-details-tabs">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden md:inline">Información</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Staff</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden md:inline">Órdenes</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">Pagos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ClinicInfoTab clinic={clinic} />
        </TabsContent>

        <TabsContent value="staff">
          <ClinicStaffTab staff={staff} clinicId={id} />
        </TabsContent>

        <TabsContent value="orders">
          <ClinicOrdersTab clinicId={id} />
        </TabsContent>

        <TabsContent value="payments">
          <ClinicPaymentsTab clinicId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
