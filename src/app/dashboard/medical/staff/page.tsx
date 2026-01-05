import { getClinicDetails } from '@/modules/medical/actions/clinics'
import { getUserClinic } from '@/modules/medical/actions/clinics'
import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, UserCog, Activity } from 'lucide-react'
import { ClinicStaffTab } from '@/modules/medical/components/clinic-staff-tab'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  // Get current user's clinic
  const clinicResponse = await getUserClinic()
  
  if (!clinicResponse.success || !clinicResponse.data) {
    redirect('/dashboard')
  }

  const clinic = clinicResponse.data

  // Get clinic details including staff
  const clinicData = await getClinicDetails(clinic.id)
  
  if (!clinicData) {
    redirect('/dashboard')
  }

  const staff = clinicData.staff || []
  
  // Calculate stats
  const totalStaff = staff.length
  const activeStaff = staff.filter((s: any) => s.is_active !== false).length
  const doctors = staff.filter((s: any) => s.role === 'clinic_doctor').length
  const admins = staff.filter((s: any) => s.role === 'clinic_admin').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Personal</h1>
        <p className="text-gray-500 mt-2">
          Administra el equipo de {clinic.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Staff Total</p>
                <p className="text-2xl font-bold text-indigo-600">{totalStaff}</p>
              </div>
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeStaff}</p>
              </div>
              <UserCheck className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Doctores</p>
                <p className="text-2xl font-bold text-purple-600">{doctors}</p>
              </div>
              <Activity className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Administradores</p>
                <p className="text-2xl font-bold text-orange-600">{admins}</p>
              </div>
              <UserCog className="h-6 w-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management Component */}
      <ClinicStaffTab staff={staff} clinicId={clinic.id} />
    </div>
  )
}
