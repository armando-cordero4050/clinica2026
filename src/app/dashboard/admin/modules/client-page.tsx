'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Database,
  Layers,
  Stethoscope,
  ShieldCheck,
  Settings,
  Activity,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react'
import { toggleModuleAction } from './actions'
import { toast } from 'sonner'

interface Module {
  id: string
  code: string
  name: string
  is_active: boolean
  version: string
  config: any
}

const MODULE_DATA: Record<string, { icon: any, color: string, description: string }> = {
  'lab_kanban': {
    icon: Layers,
    color: 'indigo',
    description: 'Gestión visual de producción mediante tableros Kamba y seguimiento de etapas.'
  },
  'medical_core': {
    icon: Stethoscope,
    color: 'teal',
    description: 'Funcionalidad central para clínicas: pacientes, odontogramas y servicios médicos.'
  },
  'bi_analytics': {
    icon: Activity,
    color: 'blue',
    description: 'Inteligencia de negocios avanzada, KPIs de rendimiento y reportes detallados.'
  },
  'security_advanced': {
    icon: ShieldCheck,
    color: 'red',
    description: 'Auditoría detallada, políticas RLS complejas y control de acceso granular.'
  },
  'inventory_lab': {
    icon: Package,
    color: 'amber',
    description: 'Control de insumos, materiales y stock para el departamento de producción.'
  }
}

export default function ModuleInstallerClient({ modules }: { modules: Module[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggle = async (mod: Module) => {
    setLoadingId(mod.id)
    toast.loading(`${mod.is_active ? 'Desactivando' : 'Activando'} módulo ${mod.name}...`, { id: 'mod-toggle' })
    
    try {
      const result = await toggleModuleAction(mod.id, !mod.is_active)
      if (result.success) {
         toast.success(`Módulo ${mod.name} actualizado con éxito`, { id: 'mod-toggle' })
      } else {
         toast.error(`Error: ${result.error}`, { id: 'mod-toggle' })
      }
    } catch (error: any) {
      toast.error(`Error de red: ${error.message}`, { id: 'mod-toggle' })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => {
        const info = MODULE_DATA[mod.code] || { 
          icon: Database, 
          color: 'gray', 
          description: 'Módulo de sistema configurado mediante el archivo central de gobernanza.' 
        }
        const Icon = info.icon

        return (
          <Card key={mod.id} className={`overflow-hidden border-none shadow-md transition-all hover:shadow-lg ${mod.is_active ? 'ring-1 ring-blue-100' : 'opacity-80 bg-gray-50/50'}`}>
            <CardHeader className={`pb-4 bg-gradient-to-br from-${info.color}-50 to-white border-b border-gray-50`}>
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-${info.color}-100 text-${info.color}-600`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono bg-white">
                    v{mod.version}
                  </Badge>
                  {mod.is_active ? (
                    <Badge className="bg-green-600 shadow-sm border-none">Activo</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-500 border-none">Inactivo</Badge>
                  )}
                </div>
              </div>
              <CardTitle className="mt-4 text-xl font-bold text-gray-900">{mod.name}</CardTitle>
              <CardDescription className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
                {mod.code}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
               <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {info.description}
               </p>
               
               <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 italic text-[11px] text-gray-400">
                   <div className="flex items-center gap-1 mb-1 font-bold">
                      <Settings className="h-3 w-3" /> Configuración Raw
                   </div>
                   <pre className="overflow-x-auto max-h-24 custom-scrollbar">
                     {JSON.stringify(mod.config, null, 2)}
                   </pre>
               </div>
            </CardContent>
            <CardFooter className="pt-2 bg-gray-50/30">
              <Button 
                variant={mod.is_active ? 'outline' : 'default'}
                className={`w-full gap-2 ${mod.is_active ? 'border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={loadingId === mod.id}
                onClick={() => handleToggle(mod)}
              >
                {loadingId === mod.id ? (
                  <Activity className="h-4 w-4 animate-spin" />
                ) : mod.is_active ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {loadingId === mod.id ? 'Procesando...' : (mod.is_active ? 'Desactivar Módulo' : 'Activar Módulo')}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
