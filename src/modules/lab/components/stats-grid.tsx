'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Settings2,
  TrendingUp
} from 'lucide-react'
import { LabDashboardStats } from '../actions'

interface StatsGridProps {
  stats: LabDashboardStats
}

export function LabStatsGrid({ stats }: StatsGridProps) {
  const items = [
    { title: 'Nuevas', value: stats.new, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'En Proceso', value: stats.in_process, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Pendientes (QC)', value: stats.pending, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'En Espera', value: stats.on_hold, icon: Settings2, color: 'text-gray-500', bg: 'bg-gray-100' },
    { title: 'Rechazadas', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Finalizadas', value: stats.delivered, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <Card key={item.title} className="hover:shadow-md transition-shadow border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.title}</p>
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
               <h2 className="text-2xl font-bold">{item.value}</h2>
               <span className="text-[10px] text-gray-400">órdenes</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
