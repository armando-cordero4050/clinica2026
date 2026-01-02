'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react'
// Removed testOdooConnection import to respect modular boundaries. 
// Odoo connection testing belongs to Core/Admin module, not Medical.

import { toast } from 'sonner'

interface SyncDebugPanelProps {
  clinicId: string
  lastSyncInfo: any
}

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
const SYNC_KEY = 'dentalflow_last_sync_time'

export function SyncDebugPanel({ clinicId, lastSyncInfo }: SyncDebugPanelProps) {
  const [syncCount, setSyncCount] = useState(0)
  const [timeUntilNext, setTimeUntilNext] = useState(300)
  const [isManualSyncing, setIsManualSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Initialize from localStorage or lastSyncInfo
  useEffect(() => {
    const storedTime = localStorage.getItem(SYNC_KEY)
    const storedCount = localStorage.getItem(`${SYNC_KEY}_count`)
    
    if (storedTime) {
      const lastSync = new Date(storedTime)
      setLastSyncTime(lastSync)
      
      // Calculate time until next sync
      const elapsed = Date.now() - lastSync.getTime()
      const remaining = Math.max(0, SYNC_INTERVAL_MS - elapsed)
      setTimeUntilNext(Math.floor(remaining / 1000))
    } else if (lastSyncInfo?.sync_completed_at) {
      const lastSync = new Date(lastSyncInfo.sync_completed_at)
      setLastSyncTime(lastSync)
      localStorage.setItem(SYNC_KEY, lastSync.toISOString())
      
      const elapsed = Date.now() - lastSync.getTime()
      const remaining = Math.max(0, SYNC_INTERVAL_MS - elapsed)
      setTimeUntilNext(Math.floor(remaining / 1000))
    }

    if (storedCount) {
      setSyncCount(parseInt(storedCount, 10))
    }
  }, [lastSyncInfo])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNext((prev) => {
        if (prev <= 1) {
          // Sync completed, reset timer
          const newSyncTime = new Date()
          setLastSyncTime(newSyncTime)
          localStorage.setItem(SYNC_KEY, newSyncTime.toISOString())
          
          const newCount = syncCount + 1
          setSyncCount(newCount)
          localStorage.setItem(`${SYNC_KEY}_count`, newCount.toString())
          
          return 300 // Reset to 5 minutes
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [syncCount])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleManualSync = async () => {
    setIsManualSyncing(true)
    try {
      const result = await triggerManualSync(clinicId)
      if (result.success) {
        toast.success(result.message || 'Sincronización completada')
        
        const newSyncTime = new Date()
        setLastSyncTime(newSyncTime)
        localStorage.setItem(SYNC_KEY, newSyncTime.toISOString())
        
        setTimeUntilNext(300) // Reset timer
        
        const newCount = syncCount + 1
        setSyncCount(newCount)
        localStorage.setItem(`${SYNC_KEY}_count`, newCount.toString())
      } else {
        toast.error(result.message || 'Error en sincronización')
      }
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setIsManualSyncing(false)
    }
  }

  return (
    <Card className="border-dashed border-2 border-orange-300 bg-orange-50/50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sync Count */}
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Sincronizaciones</p>
                <p className="text-lg font-bold text-orange-600">{syncCount}</p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Próxima en</p>
                <p className="text-lg font-bold font-mono text-blue-600">
                  {formatTime(timeUntilNext)}
                </p>
              </div>
            </div>

            {/* Last Sync Status */}
            {lastSyncInfo && (
              <div className="flex items-center gap-2">
                {lastSyncInfo.sync_status === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Última Sync</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={lastSyncInfo.sync_status === 'success' ? 'default' : 'destructive'}>
                      {lastSyncInfo.sync_status}
                    </Badge>
                    {lastSyncInfo.services_created > 0 && (
                      <span className="text-xs text-green-600">
                        +{lastSyncInfo.services_created} nuevos
                      </span>
                    )}
                    {lastSyncInfo.services_updated > 0 && (
                      <span className="text-xs text-blue-600">
                        ~{lastSyncInfo.services_updated} actualizados
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            
            {/* Manual Sync Button */}
            <Button
              onClick={handleManualSync}
              disabled={isManualSyncing}
              size="sm"
              variant="outline"
              className="border-orange-300 hover:bg-orange-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isManualSyncing ? 'animate-spin' : ''}`} />
              {isManualSyncing ? 'Sincronizando...' : 'Forzar Sync'}
            </Button>
          </div>
        </div>

        {/* Last Sync Time */}
        {lastSyncTime && (
          <div className="mt-2 text-xs text-muted-foreground">
            Última sincronización: {lastSyncTime.toLocaleString('es-GT', {
              dateStyle: 'short',
              timeStyle: 'medium'
            })}
          </div>
        )}

        {/* Dev Note */}
        <div className="mt-2 text-xs text-orange-600 font-medium">
          🔧 Panel de Debug - Persiste entre recargas usando localStorage
        </div>
      </CardContent>
    </Card>
  )
}
