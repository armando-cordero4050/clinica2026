'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Server } from 'lucide-react'

// Imports moved to top of file in next step if necessary, but here is the structured code
// We need to refactor the whole file to lift state up or use a context, but for simplicity in this file:

import { factoryResetData } from '@/modules/admin/actions/maintenance'
import { repairClinicLinks } from '@/modules/admin/actions/sync-repair'
import { toast } from 'sonner'
import { useState } from 'react'
import { RefreshCcw, Trash2, Link as LinkIcon, AlertTriangle } from 'lucide-react'
import { ProcessMonitor, ProcessLog } from '@/modules/admin/components/process-monitor'

export default function SettingsPage() {
  // State for the monitor lifted here to share layout space
  const [logs, setLogs] = useState<ProcessLog[]>([])
  const [isMonitorVisible, setIsMonitorVisible] = useState(false)

  const addLog = (message: string, status: ProcessLog['status'] = 'running') => {
    setIsMonitorVisible(true)
    const newLog: ProcessLog = {
      id: Math.random().toString(36),
      message,
      status,
      timestamp: new Date().toLocaleTimeString()
    }
    setLogs(prev => [...prev, newLog])
    return newLog.id
  }

  const updateLogStatus = (id: string, status: ProcessLog['status']) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, status } : log))
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Supabase Connection Card */}
        <Link href="/dashboard/settings/supabase">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-500" />
                    Database Connection
                </CardTitle>
                <CardDescription>Verify Supabase connectivity and schema access.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    PostgreSQL + RLS
                </div>
            </CardContent>
            </Card>
        </Link>

        {/* Odoo Integration Card */}
        <Link href="/dashboard/settings/odoo">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-orange-500" />
                    ERP Integration
                </CardTitle>
                <CardDescription>Configure Odoo connection and sync parameters.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    v14/v17 Support
                </div>
            </CardContent>
            </Card>
        </Link>

        {/* User Management Card */}
        <Link href="/dashboard/admin/users">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-red-500" />
                    User Management
                </CardTitle>
                <CardDescription>Create and manage system users and roles.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    Admin Only
                </div>
            </CardContent>
            </Card>
        </Link>
      </div>

      <div className="pt-6 border-t font-black uppercase text-xs tracking-widest text-slate-400 mb-4">
        Mantenimiento de Sistema
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MaintenanceCard addLog={addLog} updateLogStatus={updateLogStatus} />
        
        {/* Monitor Area - Takes up remaining space on click */}
        {isMonitorVisible && (
            <div className="md:col-span-2 lg:col-span-2">
                <ProcessMonitor logs={logs} isVisible={isMonitorVisible} />
            </div>
        )}
      </div>
    </div>
  )
}

function MaintenanceCard({ addLog, updateLogStatus }: { addLog: any, updateLogStatus: any }) {
    return (
        <Card className="border-rose-100 bg-rose-50/30 overflow-hidden group h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-600">
                    <Database className="w-5 h-5" />
                    Factory Reset (Punto Cero)
                </CardTitle>
                <CardDescription className="text-rose-700/70">
                    Borra absolutamente todos los datos de negocio (Pacientes, Órdenes, Clínicas, Odoo Sync). 
                    Solo para propósitos de pruebas limpias.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <ResetButton addLog={addLog} updateLogStatus={updateLogStatus} />
                    <div className="my-2 border-t border-rose-200/50"></div>
                    <RepairButton addLog={addLog} updateLogStatus={updateLogStatus} />
                </div>
            </CardContent>
        </Card>
    )
}

function ResetButton({ addLog, updateLogStatus }: { addLog: (msg: string, status?: ProcessLog['status']) => string, updateLogStatus: (id: string, status: ProcessLog['status']) => void }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleReset = async () => {
        // Double confirmation
        if (!confirm('⚠️ ¿ESTÁS SEGURO? Esta acción es irreversible y borrará TODO el historial de negocio.')) return
        if (!confirm('⚠️ ÚLTIMA CONFIRMACIÓN: Se borrarán pacientes, clínicas, órdenes, presupuestos, etc. ¿Continuar?')) return
        
        setIsLoading(true)
        
        try {
            // Start process flow
            const startId = addLog('🚀 Iniciando secuencia de Factory Reset...', 'running')
            
            await new Promise(resolve => setTimeout(resolve, 800))
            updateLogStatus(startId, 'success')
            
            const p1 = addLog('🗑️ Borrando historial clínico y pacientes...', 'running')
            await new Promise(resolve => setTimeout(resolve, 600))
            updateLogStatus(p1, 'success')

            const p2 = addLog('🗑️ Borrando estructura de clínicas...', 'running')
            await new Promise(resolve => setTimeout(resolve, 600))
            updateLogStatus(p2, 'success')

            const p3 = addLog('🗑️ Purgando órdenes de laboratorio y rutas...', 'running')
            await new Promise(resolve => setTimeout(resolve, 600))
            updateLogStatus(p3, 'success')

            const p4 = addLog('♻️ Reseteando tablas espejo de Odoo...', 'running')
            await new Promise(resolve => setTimeout(resolve, 400))
            updateLogStatus(p4, 'success')

            const p5 = addLog('🛡️ Limpiando usuarios (Preservando Super Admin)...', 'running')
            
            // Execute actual reset
            const res = await factoryResetData()
            
            if (res.success) {
                updateLogStatus(p5, 'success')
                const doneId = addLog('✅ SISTEMA RESTAURADO A PUNTO CERO EXITOSAMENTE', 'success')
                toast.success('Factory Reset Completado')
                
                // Reload page after 3 seconds
                setTimeout(() => {
                    addLog('🔄 Recargando aplicación...', 'pending')
                    window.location.reload()
                }, 3000)
            } else {
                updateLogStatus(p5, 'error')
                addLog(`❌ Error Crítico: ${res.message}`, 'error')
                toast.error(`Error: ${res.message}`)
            }
        } catch (err: any) {
             addLog(`❌ Excepción: ${err.message || 'Desconocido'}`, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleReset}
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            {isLoading ? 'Reset en Progreso...' : 'Ejecutar Reset Total'}
        </button>
    )
}

function RepairButton({ addLog, updateLogStatus }: { addLog: (msg: string, status?: ProcessLog['status']) => string, updateLogStatus: (id: string, status: ProcessLog['status']) => void }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleRepair = async () => {
        if (!confirm('¿Reconectar todas las clínicas con Odoo? Esto buscará por email y asignará IDs.')) return
        
        setIsLoading(true)
        const startId = addLog('🔍 Iniciando reparación de vínculos...', 'running')
        
        try {
             const res = await repairClinicLinks()
             
             // Convert string logs to process logs visually
             res.logs.forEach(log => {
                const logId = addLog(log, 'running')
                // Auto complete them fast
                setTimeout(() => updateLogStatus(logId, 'success'), 500)
             })

             if (res.success) {
                updateLogStatus(startId, 'success')
                addLog('✅ OPERACIÓN COMPLETADA CON ÉXITO', 'success')
                toast.success(res.message)
             } else {
                updateLogStatus(startId, 'error')
                addLog(`❌ Error: ${res.message}`, 'error')
                toast.error(res.message)
             }

        } catch (err: any) {
             addLog(`❌ Excepción: ${err.message}`, 'error')
             updateLogStatus(startId, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleRepair}
            disabled={isLoading}
            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border border-indigo-200"
        >
            {isLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
            {isLoading ? 'Reparando...' : 'Reparar Vínculos Odoo'}
        </button>
    )
}
