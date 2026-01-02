import { getLabDashboardStats, getLabProductionChart, getKanbanCards } from '@/modules/lab/actions'
import { LabStatsGrid } from '@/modules/lab/components/stats-grid'
import { LabProductionChart } from '@/modules/lab/components/production-chart'
import { LabOrdersTable } from '@/modules/lab/components/orders-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function LabDashboardPage() {
  const supabase = await createClient()
  const { data: profile } = await supabase.rpc('get_my_profile')
  const userRole = profile?.role || 'lab_staff'

  const [stats, chartData, orders] = await Promise.all([
    getLabDashboardStats(),
    getLabProductionChart(),
    getKanbanCards()
  ])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
             Laboratorio: Panel de Control
             <Badge variant="outline" className="text-[10px] uppercase bg-white">{userRole}</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">Monitoreo de producción, KPIs y sincronización Odoo.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <LabStatsGrid stats={stats} />

      {/* Chart and Secondary Data */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3">
            <LabProductionChart data={chartData} />
         </div>
         <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
               <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 opacity-80">
                     <TrendingUp className="h-4 w-4" />
                     <span className="text-xs uppercase font-bold tracking-widest">SLA Global</span>
                  </div>
               </CardHeader>
               <CardContent>
                  <div className="text-4xl font-bold">{stats.avg_sla_pct || 0}%</div>
                  <p className="text-xs mt-2 opacity-90 text-blue-100 italic">
                     Eficiencia promedio acumulada
                  </p>
               </CardContent>
            </Card>

            <Alert className="border-orange-200 bg-orange-50/50">
               <AlertCircle className="h-4 w-4 text-orange-600" />
               <AlertTitle className="text-orange-800 font-bold text-xs uppercase">Aviso Crítico</AlertTitle>
               <AlertDescription className="text-orange-700 text-[10px]">
                  Hay {stats.pending} órdenes en Control de Calidad esperando aprobación de despacho.
               </AlertDescription>
            </Alert>
         </div>
      </div>

      {/* Main Orders Table */}
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Órdenes Recientes</h2>
            <Badge variant="secondary">{orders.length} total</Badge>
         </div>
         <LabOrdersTable orders={orders} />
      </div>
    </div>
  )
}
