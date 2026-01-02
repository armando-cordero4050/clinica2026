import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, Package, TrendingUp, Activity, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch user profile to determine primary entry point
  const { data: profile } = await supabase.rpc('get_my_profile')
  const role = profile?.role || 'patient'

  // Smart Redirection based on role
  if (role === 'lab_admin' || role === 'lab_staff') {
    redirect('/dashboard/lab')
  }

  if (role === 'clinic_admin' || role === 'doctor' || role === 'receptionist') {
    redirect('/dashboard/medical/patients')
  }

  // Super admins get a comprehensive dashboard
  if (role === 'super_admin') {
    // Fetch system statistics
    const { data: users } = await supabase.rpc('get_all_users_with_sessions')
    const { data: clinics } = await supabase.from('clinics').select('id, name, is_active')
    const { data: labOrders } = await supabase.from('lab_orders').select('id, status').limit(1000)
    const { data: services } = await supabase.from('lab_services').select('id, name, is_active')

    const totalUsers = users?.length || 0
    const activeUsers = users?.filter((u: any) => u.has_active_session).length || 0
    const totalClinics = clinics?.length || 0
    const activeClinics = clinics?.filter((c: any) => c.is_active).length || 0
    const totalOrders = labOrders?.length || 0
    const pendingOrders = labOrders?.filter((o: any) => o.status === 'pending').length || 0
    const totalServices = services?.length || 0
    const activeServices = services?.filter((s: any) => s.is_active).length || 0

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
            <p className="text-muted-foreground mt-2">Vista general del sistema DentalFlow</p>
          </div>
          <Badge className="bg-red-500 text-white px-4 py-2">Super Admin</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Users Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">{activeUsers} activos</span> en las últimas 24h
              </p>
            </CardContent>
          </Card>

          {/* Clinics Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clínicas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClinics}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">{activeClinics} activas</span> en el sistema
              </p>
            </CardContent>
          </Card>

          {/* Lab Orders Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Lab</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-orange-600 font-medium">{pendingOrders} pendientes</span> de procesar
              </p>
            </CardContent>
          </Card>

          {/* Services Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servicios</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">{activeServices} activos</span> disponibles
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Usuarios conectados recientemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users?.filter((u: any) => u.has_active_session).slice(0, 5).map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No hay usuarios activos</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>Métricas clave del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasa de Actividad</span>
                  <span className="text-sm font-bold">{totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Clínicas Activas</span>
                  <span className="text-sm font-bold">{totalClinics > 0 ? Math.round((activeClinics / totalClinics) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Órdenes Pendientes</span>
                  <span className="text-sm font-bold">{totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Servicios Disponibles</span>
                  <span className="text-sm font-bold">{totalServices > 0 ? Math.round((activeServices / totalServices) * 100) : 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Bienvenido a DentalFlow 2026. Tu rol ({role}) no tiene un dashboard asignado.</p>
    </div>
  )
}
