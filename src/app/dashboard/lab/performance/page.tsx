import { getUserPerformanceData, getLabUsers } from '@/modules/lab/actions/performance'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Award, Users, Clock, Target } from 'lucide-react'

const STAGE_LABELS: Record<string, string> = {
  'clinic_pending': 'Clínica Pendiente',
  'digital_picking': 'Picking Digital',
  'income_validation': 'Validación Ingresos',
  'gypsum': 'Yesos',
  'design': 'Diseño',
  'client_approval': 'Aprobación Cliente',
  'nesting': 'Nesting',
  'production_man': 'Producción Manual',
  'qa': 'Control de Calidad',
  'billing': 'Facturación',
  'delivery': 'Entrega'
}

export default async function PerformancePage() {
  const [performanceData, labUsers] = await Promise.all([
    getUserPerformanceData(),
    getLabUsers()
  ])

  // Group performance by user
  const userStats = performanceData.reduce((acc, perf) => {
    if (!acc[perf.user_email]) {
      acc[perf.user_email] = {
        email: perf.user_email,
        userId: perf.user_id,
        stages: [],
        totalOrders: 0,
        avgPerformance: 0
      }
    }
    acc[perf.user_email].stages.push(perf)
    acc[perf.user_email].totalOrders += perf.total_orders
    return acc
  }, {} as Record<string, any>)

  // Calculate average performance per user
  Object.values(userStats).forEach((user: any) => {
    const validPerfs = user.stages.filter((s: any) => s.performance_pct > 0)
    user.avgPerformance = validPerfs.length > 0
      ? validPerfs.reduce((sum: number, s: any) => sum + s.performance_pct, 0) / validPerfs.length
      : 0
  })

  const sortedUsers = Object.values(userStats).sort((a: any, b: any) => b.avgPerformance - a.avgPerformance)

  // Global stats
  const totalOrdersProcessed = performanceData.reduce((sum, p) => sum + p.total_orders, 0)
  const avgGlobalPerformance = sortedUsers.length > 0
    ? sortedUsers.reduce((sum: any, u: any) => sum + u.avgPerformance, 0) / sortedUsers.length
    : 0

  return (
    <div className="space-y-6 container max-w-7xl py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold">Rendimiento por Usuario</h1>
            <p className="text-muted-foreground italic">Métricas de productividad del equipo de laboratorio</p>
          </div>
        </div>
        <Badge className="bg-purple-600 text-white text-sm px-3 py-1">
          <Users className="h-3 w-3 mr-1" />
          {sortedUsers.length} Usuarios Activos
        </Badge>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Órdenes Procesadas</p>
                <p className="text-3xl font-bold text-indigo-600">{totalOrdersProcessed}</p>
              </div>
              <Target className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Rendimiento Promedio</p>
                <p className="text-3xl font-bold text-green-600">{avgGlobalPerformance.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Usuarios Evaluados</p>
                <p className="text-3xl font-bold text-purple-600">{sortedUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Performance Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Ranking de Rendimiento
        </h2>

        {sortedUsers.length === 0 ? (
          <Card className="border-none shadow-md">
            <CardContent className="py-12 text-center text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hay datos de rendimiento disponibles</p>
              <p className="text-sm mt-1">Los datos aparecerán cuando las órdenes completen etapas en el Kamba</p>
            </CardContent>
          </Card>
        ) : (
          sortedUsers.map((user: any, index: number) => (
            <Card key={user.userId} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' :
                      'bg-gray-300'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.email}</CardTitle>
                      <CardDescription className="text-xs">
                        {user.totalOrders} órdenes procesadas
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-sm px-3 py-1 ${
                      user.avgPerformance >= 100 ? 'bg-green-600' :
                      user.avgPerformance >= 80 ? 'bg-blue-600' :
                      user.avgPerformance >= 60 ? 'bg-amber-600' :
                      'bg-red-600'
                    }`}>
                      {user.avgPerformance >= 100 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {user.avgPerformance.toFixed(1)}% Eficiencia
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {user.stages.map((stage: any) => (
                    <div 
                      key={stage.stage} 
                      className="p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 truncate">
                        {STAGE_LABELS[stage.stage] || stage.stage}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-lg font-bold text-gray-900">{stage.avg_time_hours}h</p>
                        <p className="text-[10px] text-gray-400">/ {stage.target_hours}h</p>
                      </div>
                      <div className="mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] h-4 px-1 ${
                            stage.performance_pct >= 100 ? 'bg-green-50 text-green-700 border-green-200' :
                            stage.performance_pct >= 80 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {stage.performance_pct.toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">{stage.total_orders} órdenes</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-start gap-3">
        <Award className="h-5 w-5 text-purple-600 mt-0.5" />
        <div className="text-xs text-purple-800 space-y-1">
          <p className="font-bold uppercase">Cómo se Calcula el Rendimiento</p>
          <p>
            El % de eficiencia se calcula comparando el tiempo promedio empleado vs el tiempo objetivo configurado en SLA.
            Un 100% significa que el usuario cumple exactamente con el tiempo objetivo. Más de 100% indica que trabaja más rápido que el objetivo.
          </p>
        </div>
      </div>
    </div>
  )
}
