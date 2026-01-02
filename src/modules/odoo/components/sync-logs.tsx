'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SyncLog {
  id: string
  module: string
  operation: string
  status: 'success' | 'error' | 'partial'
  records_processed: number
  records_failed: number
  error_message: string | null
  started_at: string
  completed_at: string | null
}

const MODULE_LABELS: Record<string, string> = {
  sales: 'Ventas',
  customers: 'Clientes',
  products: 'Productos',
  invoices: 'Facturas'
}

const STATUS_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-600'
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-600'
  },
  partial: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-600'
  }
}

export function OdooSyncLogs() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient()

  const fetchLogs = useCallback(async () => {
    setRefreshing(true)
    const { data, error } = await supabase.rpc('get_odoo_sync_logs', {
      p_limit: 20
    })

    if (error) {
      console.error('Error fetching sync logs:', error)
    } else if (data) {
      setLogs(data)
    }
    setLoading(false)
    setRefreshing(false)
  }, [supabase])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const getSuccessRate = () => {
    if (logs.length === 0) return 0
    const successful = logs.filter(l => l.status === 'success').length
    return Math.round((successful / logs.length) * 100)
  }

  const getTotalRecordsProcessed = () => {
    return logs.reduce((sum, log) => sum + log.records_processed, 0)
  }

  if (loading) {
    return (
      <Card className="border-none shadow-md">
        <CardContent className="py-12 text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin text-gray-400" />
          <p className="text-gray-500">Cargando logs...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Sincronizaciones
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Últimas 20 operaciones con Odoo
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLogs}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Operaciones</p>
            <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Tasa de Éxito</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-green-600">{getSuccessRate()}%</p>
              {getSuccessRate() >= 80 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Registros Procesados</p>
            <p className="text-2xl font-bold text-purple-600">{getTotalRecordsProcessed()}</p>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hay logs de sincronización</p>
              <p className="text-sm mt-1">Los logs aparecerán cuando realices sincronizaciones con Odoo</p>
            </div>
          ) : (
            logs.map((log) => {
              const config = STATUS_CONFIG[log.status]
              const Icon = config.icon
              const duration = log.completed_at 
                ? Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)
                : 0

              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${config.border} ${config.bg} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900">
                            {MODULE_LABELS[log.module] || log.module}
                          </p>
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {log.operation}
                          </Badge>
                          <Badge className={`${config.badge} text-white text-[10px] h-4 px-1`}>
                            {log.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                          <div>
                            <p className="text-gray-500">Procesados</p>
                            <p className="font-bold text-green-600">{log.records_processed}</p>
                          </div>
                          {log.records_failed > 0 && (
                            <div>
                              <p className="text-gray-500">Fallidos</p>
                              <p className="font-bold text-red-600">{log.records_failed}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500">Duración</p>
                            <p className="font-bold text-gray-700">{duration}s</p>
                          </div>
                        </div>

                        {log.error_message && (
                          <div className="mt-3 p-2 bg-white rounded border border-red-200">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Error:</p>
                            <p className="text-xs text-red-700 font-mono">{log.error_message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">
                        {formatDistanceToNow(new Date(log.started_at), { 
                          addSuffix: true,
                          locale: es 
                        })}
                      </p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        {new Date(log.started_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
