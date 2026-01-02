'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Database, 
  RefreshCw, 
  Settings2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Link as LinkIcon,
  Search,
  History,
  TrendingUp,
  LayoutGrid,
  Truck,
  Package,
  Users,
  Receipt,
  Globe,
  Loader2
} from 'lucide-react'
import { getOdooConfig, testOdooConnection, getOdooSyncLogs } from '@/modules/odoo/actions/sync'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Progress } from '@/components/ui/progress'

const MODULE_LABELS: Record<string, string> = {
  sales: 'Ventas',
  customers: 'Clientes',
  products: 'Productos',
  invoices: 'Facturas'
}

const MODULE_ICONS: Record<string, any> = {
  sales: TrendingUp,
  customers: Users,
  products: Package,
  invoices: Receipt
}

export default function OdooConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({})
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [fieldMappings, setFieldMappings] = useState<any>({
    sales: [],
    customers: [],
    products: [],
    invoices: []
  })
  const [isUpdatingMapping, setIsUpdatingMapping] = useState(false)

  useEffect(() => {
    fetchConfig()
    fetchLogs()
    fetchAllMappings()
  }, [])

  const fetchConfig = async () => {
    const data = await getOdooConfig()
    if (data) setConfig(data)
    setLoading(false)
  }

  const fetchLogs = async () => {
    const { data } = await getOdooSyncLogs(15)
    if (data) setLogs(data)
  }

  const fetchAllMappings = async () => {
    await Promise.all([
      fetchFieldMappings('sales'),
      fetchFieldMappings('customers'),
      fetchFieldMappings('products'),
      fetchFieldMappings('invoices')
    ])
  }

  const fetchFieldMappings = async (module: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.rpc('get_odoo_field_mappings', { p_module: module })
      if (data) {
        setFieldMappings((prev: any) => ({ ...prev, [module]: data }))
      }
    } catch (error) {
      console.error(`Error fetching mappings for ${module}:`, error)
    }
  }

  const toggleFieldMapping = async (mappingId: string, module: string) => {
    setIsUpdatingMapping(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const mapping = fieldMappings[module].find((m: any) => m.id === mappingId)
      const newStatus = !mapping.is_enabled
      
      const { error } = await supabase
        .from('odoo_field_mappings')
        .update({ is_enabled: newStatus })
        .eq('id', mappingId)
      
      if (error) throw error
      
      // Update local state
      setFieldMappings((prev: any) => ({
        ...prev,
        [module]: prev[module].map((m: any) => 
          m.id === mappingId ? { ...m, is_enabled: newStatus } : m
        )
      }))
      
      toast.success(`Campo ${newStatus ? 'habilitado' : 'deshabilitado'}`)
    } catch (error: any) {
      toast.error('Error al actualizar mapeo: ' + error.message)
    } finally {
      setIsUpdatingMapping(false)
    }
  }

  const handleTestConnection = async () => {
    setSyncing(true)
    setTestResult(null)
    const result = await testOdooConnection()
    setTestResult(result)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    setSyncing(false)
  }

  const simulateProgress = (module: string) => {
    setModuleProgress(prev => ({ ...prev, [module]: 0 }))
    const interval = setInterval(() => {
      setModuleProgress(prev => {
        const currentProgress = prev[module] || 0
        if (currentProgress < 90) {
          return { ...prev, [module]: currentProgress + (Math.random() * 10) }
        }
        return prev
      })
    }, 400)
    return interval
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    toast.info('Iniciando sincronización global de Odoo...')
    
    try {
      const { 
        syncSalesFromOdoo,
        syncCustomersFromOdoo, 
        syncStaffFromOdoo, 
        syncProductsFromOdoo, 
        syncInvoicesFromOdoo 
      } = await import('@/modules/odoo/actions/sync')
      
      const intervalSales = simulateProgress('sales')
      toast.loading('Sincronizando órdenes de venta...', { id: 'sync-all' })
      const resSales = await syncSalesFromOdoo()
      clearInterval(intervalSales)
      setModuleProgress(prev => ({ ...prev, sales: 100 }))

      // Sync Customers & Staff (shared progress on 'customers' card)
      const intervalCustomers = simulateProgress('customers')
      toast.loading('Sincronizando clientes y clínicas...', { id: 'sync-all' })
      const resCustomers = await syncCustomersFromOdoo()
      
      toast.loading('Sincronizando staff y contactos...', { id: 'sync-all' })
      const resStaff = await syncStaffFromOdoo()
      clearInterval(intervalCustomers)
      setModuleProgress(prev => ({ ...prev, customers: 100 }))
      
      const intervalProducts = simulateProgress('products')
      toast.loading('Sincronizando productos y servicios...', { id: 'sync-all' })
      const resProducts = await syncProductsFromOdoo()
      clearInterval(intervalProducts)
      setModuleProgress(prev => ({ ...prev, products: 100 }))

      const intervalInvoices = simulateProgress('invoices')
      toast.loading('Sincronizando facturas...', { id: 'sync-all' })
      const resInvoices = await syncInvoicesFromOdoo()
      clearInterval(intervalInvoices)
      setModuleProgress(prev => ({ ...prev, invoices: 100 }))
      
      if (resSales.success && resCustomers.success && resStaff.success && resProducts.success && resInvoices.success) {
        toast.success('Sincronización global completada con éxito', { id: 'sync-all' })
      } else {
        toast.warning('Sincronización global completada con algunas advertencias', { id: 'sync-all' })
      }
      
      await fetchLogs()
      setTimeout(() => setModuleProgress({}), 3000)
    } catch (error: any) {
      toast.error(`Error en sincronización global: ${error.message}`, { id: 'sync-all' })
      setModuleProgress({})
    } finally {
      setSyncing(false)
    }
  }

  const handleManualSync = async (module: string) => {
    setSyncing(true)
    const interval = simulateProgress(module)
    toast.info(`Iniciando sincronización de ${MODULE_LABELS[module]}...`)
    
    try {
      let result
      
      if (module === 'sales') {
        const { syncSalesFromOdoo } = await import('@/modules/odoo/actions/sync')
        result = await syncSalesFromOdoo()
      } else if (module === 'customers') {
        const { syncCustomersFromOdoo } = await import('@/modules/odoo/actions/sync')
        result = await syncCustomersFromOdoo()
      } else if (module === 'products') {
        const { syncProductsFromOdoo } = await import('@/modules/odoo/actions/sync')
        result = await syncProductsFromOdoo()
      } else if (module === 'invoices') {
        const { syncInvoicesFromOdoo } = await import('@/modules/odoo/actions/sync')
        result = await syncInvoicesFromOdoo()
      } else {
        toast.warning('Sincronización no implementada para este módulo')
        clearInterval(interval)
        setModuleProgress(prev => ({ ...prev, [module]: 0 }))
        setSyncing(false)
        return
      }
      
      if (result.success) {
        toast.success(result.message)
        setModuleProgress(prev => ({ ...prev, [module]: 100 }))
        await fetchLogs()
        setTimeout(() => setModuleProgress(prev => ({ ...prev, [module]: 0 })), 3000)
      } else {
        toast.error(result.message)
        setModuleProgress(prev => ({ ...prev, [module]: 0 }))
      }
    } catch (error: any) {
      toast.error(`Error en sincronización: ${error.message}`)
      setModuleProgress(prev => ({ ...prev, [module]: 0 }))
    } finally {
      clearInterval(interval)
      setSyncing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Cargando configuración...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Odoo Sync</h1>
          <p className="text-gray-500 mt-1">Motor de integración y sincronización en tiempo real</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSyncAll} 
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-all active:scale-95 gap-2 px-6"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar Todo
          </Button>
        </div>
      </div>

      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 items-center justify-center flex to-blue-600 text-white border-none shadow-lg overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <History className="h-24 w-24" />
          </div>
          <CardContent className="pt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Operaciones</p>
            <div className="text-5xl font-black tabular-nums">{logs.length}</div>
            <p className="text-[10px] mt-4 font-bold opacity-50 bg-white/10 py-1 px-3 rounded-full inline-block uppercase">Historial Maestro</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="h-24 w-24" />
          </div>
          <CardContent className="pt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Tasa de Éxito</p>
            <div className="text-5xl font-black tabular-nums">100%</div>
            <p className="text-[10px] mt-4 font-bold opacity-50 bg-white/10 py-1 px-3 rounded-full inline-block uppercase">Estabilidad RPC</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none shadow-lg overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <LayoutGrid className="h-24 w-24" />
          </div>
          <CardContent className="pt-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Items Sincronizados</p>
            <div className="text-5xl font-black tabular-nums tracking-tighter">
              {logs.reduce((acc, log) => acc + (log.records_processed || 0), 0)}
            </div>
            <p className="text-[10px] mt-4 font-bold opacity-50 bg-white/10 py-1 px-3 rounded-full inline-block uppercase">Flujo de Datos</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. SYNC MODULES (GRID) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold ml-1">
          <Settings2 className="h-5 w-5 text-indigo-500" />
          Módulos de Sincronización
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(MODULE_LABELS).map(([key, label]) => {
            const Icon = MODULE_ICONS[key] || Truck
            const mappings = fieldMappings[key] || []
            const activeCount = mappings.filter((m: any) => m.is_enabled).length
            
            return (
              <Card key={key} className="border-none shadow-xl bg-white hover:ring-2 hover:ring-indigo-100 transition-all overflow-hidden group">
                <div className="h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:rotate-6 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-indigo-500" />
                            Configurar Mapeo: {label}
                          </DialogTitle>
                          <DialogDescription>
                            Selecciona los campos de Odoo que deseas sincronizar para este módulo.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-height-[400px] overflow-y-auto space-y-4 py-4 pr-2">
                          {mappings.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 font-medium">No hay campos configurados para este módulo</div>
                          ) : (
                            mappings.map((mapping: any) => (
                              <div key={mapping.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-white border border-transparent hover:border-indigo-100 transition-all">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-gray-800">{mapping.description || mapping.app_field_name || mapping.odoo_field_name}</p>
                                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">ID Odoo: {mapping.odoo_field_name}</p>
                                </div>
                                <Switch 
                                  checked={mapping.is_enabled} 
                                  onCheckedChange={() => toggleFieldMapping(mapping.id, key)}
                                  disabled={isUpdatingMapping}
                                />
                              </div>
                            ))
                          )}
                        </div>
                        <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-4 mt-4">
                           <DialogDescription className="text-[10px] text-gray-400 text-center w-full">
                            Los cambios se aplican automáticamente en la próxima sincronización.
                           </DialogDescription>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardTitle className="text-xl font-black text-gray-800 tracking-tight">{label}</CardTitle>
                  <CardDescription className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-1">
                    {activeCount} de {mappings.length} campos activos
                  </CardDescription>
                  {moduleProgress[key] > 0 && (
                    <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="flex justify-between items-center text-[9px] font-bold text-indigo-600 uppercase tracking-tighter">
                        <span>Sincronizando...</span>
                        <span>{Math.round(moduleProgress[key])}%</span>
                      </div>
                      <Progress value={moduleProgress[key]} className="h-1 bg-indigo-50" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <Button 
                    onClick={() => handleManualSync(key)}
                    disabled={syncing}
                    className="w-full bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs gap-2 transition-all border-none"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncing && moduleProgress[key] > 0 ? 'animate-spin' : ''}`} />
                    {moduleProgress[key] > 0 ? 'PROCESANDO...' : 'SINCRONIZAR'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 3. SYNC HISTORY (MASTER TABLE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-gray-800 font-bold">
            <History className="h-5 w-5 text-blue-500" />
            Registro Global de Sincronización
          </div>
          <Button variant="ghost" size="sm" onClick={fetchLogs} className="text-blue-600 hover:bg-blue-50 font-bold transition-colors">
            Actualizar Registro
          </Button>
        </div>
        
        <Card className="border-none shadow-xl bg-white/90 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Módulo</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operación</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">No hay actividad reciente en el registro</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-indigo-600">
                              {log.module === 'products' ? <Package className="h-4 w-4" /> : 
                               log.module === 'customers' ? <Users className="h-4 w-4" /> :
                               log.module === 'invoices' ? <Receipt className="h-4 w-4" /> :
                               <LayoutGrid className="h-4 w-4" />}
                           </div>
                           <span className="font-bold text-gray-800">{MODULE_LABELS[log.module] || log.module}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 uppercase text-[9px] font-black">{log.operation}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           {log.status === 'success' ? (
                             <>
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                               <span className="text-[11px] font-bold text-emerald-600 uppercase">Éxito</span>
                             </>
                           ) : (
                             <>
                               <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                               <span className="text-[11px] font-bold text-red-600 uppercase">Fallo</span>
                             </>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4 text-xs font-mono">
                           <span className="text-gray-800">OK: <b className="text-indigo-600">{log.records_processed || 0}</b></span>
                           <span className="text-gray-300">|</span>
                           <span className="text-gray-400">Err: <b>{log.records_failed || 0}</b></span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-[11px] font-bold text-gray-600">Hace {formatDistanceToNow(new Date(log.completed_at), { locale: es })}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{new Date(log.completed_at).toLocaleTimeString()}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 4. DISCRETE CONNECTION BAR (BOTTOM) */}
      <div className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full ${config ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-gray-300'}`} />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
                <p className="text-xs font-bold text-gray-700 leading-none">{config ? 'Servidor Conectado' : 'Sin Conexión'}</p>
              </div>
           </div>
           
           {config && (
              <div className="hidden lg:flex items-center gap-6 border-l border-gray-100 pl-8">
                 <div className="flex items-center gap-2 group cursor-help">
                    <Globe className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600">{config.url}</span>
                 </div>
                 <div className="flex items-center gap-2 group cursor-help">
                    <Database className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600">{config.database}</span>
                 </div>
              </div>
           )}
        </div>

        <div className="flex items-center gap-4">
           {testResult && (
              <Badge className={`px-4 py-1 font-black tracking-tighter shadow-sm border-none transition-all animate-in zoom-in-95 duration-300 ${testResult.success ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                {testResult.success ? 'ENLACE RPC OK' : 'FALLO DE CREDENCIALES'}
              </Badge>
           )}
           <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTestConnection}
              disabled={syncing}
              className="h-10 rounded-xl px-6 font-bold text-xs gap-2 border-gray-200 hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-700 transition-all active:scale-95"
            >
              <LinkIcon className={`h-3.5 w-3.5 ${syncing ? 'animate-pulse' : ''}`} />
              PROBAR ENLACE
            </Button>
        </div>
      </div>
    </div>
  )
}
