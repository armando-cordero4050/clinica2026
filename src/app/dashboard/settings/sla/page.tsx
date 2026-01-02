'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Save, Timer, TrendingUp, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SLAConfig {
  stage: string
  target_hours: number
  warning_hours: number
  is_active: boolean
}

const STAGE_LABELS: Record<string, string> = {
  'clinic_pending': '1. Clínica Pendiente',
  'digital_picking': '2. Picking Digital',
  'income_validation': '3. Validación Ingresos',
  'gypsum': '4. Yesos',
  'design': '5. Diseño',
  'client_approval': '6. Aprobación Cliente',
  'nesting': '7. Nesting',
  'production_man': '8. Producción Manual',
  'qa': '9. Control de Calidad',
  'billing': '10. Facturación',
  'delivery': '11. Entrega'
}

export default function SLAConfigPage() {
  const [loading, setLoading] = useState(true)
  const [configs, setConfigs] = useState<SLAConfig[]>([])
  const [editMode, setEditMode] = useState<Record<string, boolean>>({})
  const [userRole, setUserRole] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  
  const supabase = createClient()

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: profile } = await supabase.rpc('get_my_profile')
      if (profile?.role) {
        setUserRole(profile.role)
        // Only lab_admin, lab_coordinator, and super_admin can edit SLA
        setCanEdit(['super_admin', 'lab_admin', 'lab_coordinator'].includes(profile.role))
      }
    }
    fetchUserRole()
  }, [supabase])

  const fetchConfigs = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_sla_configs')
    
    if (error) {
      console.error('Error fetching SLA configs:', error)
      toast.error('Error al cargar configuración de SLA')
    } else if (data) {
      setConfigs(data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])


  const handleUpdate = async (stage: string, targetHours: number, warningHours: number) => {
    const { data, error } = await supabase.rpc('update_sla_config', {
      p_stage: stage,
      p_target_hours: targetHours,
      p_warning_hours: warningHours
    })
    
    if (error) {
      toast.error('Error de conexión al actualizar SLA')
      console.error('Connection error:', error)
      return
    }
    
    // Check the response from the RPC
    if (data && typeof data === 'object') {
      if (data.success) {
        toast.success(`SLA actualizado para ${STAGE_LABELS[stage]}`)
        setEditMode(prev => ({ ...prev, [stage]: false }))
        fetchConfigs()
      } else {
        toast.error(data.error || 'Error desconocido al actualizar SLA')
        console.error('RPC error:', data)
      }
    } else {
      toast.error('Respuesta inesperada del servidor')
      console.error('Unexpected response:', data)
    }
  }

  const getTotalSLA = () => {
    return configs.reduce((sum, c) => sum + c.target_hours, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 container max-w-6xl py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Timer className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold">Configuración de SLA por Etapa</h1>
            <p className="text-muted-foreground italic">Define el tiempo objetivo para cada departamento del Kamba</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge className="bg-indigo-600 text-white text-sm px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            SLA Total: {getTotalSLA()}h
          </Badge>
          <span className="text-[10px] text-gray-400">Tiempo ideal de producción completa</span>
        </div>
      </div>

      {/* Read-Only Notice for Clinic Users */}
      {!canEdit && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">
                Vista de solo lectura - Solo los administradores del laboratorio pueden modificar los tiempos de SLA
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Etapas Configuradas</p>
                <p className="text-3xl font-bold text-indigo-600">{configs.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Promedio por Etapa</p>
                <p className="text-3xl font-bold text-green-600">{(getTotalSLA() / configs.length).toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Etapa Más Larga</p>
                <p className="text-3xl font-bold text-amber-600">
                  {Math.max(...configs.map(c => c.target_hours))}h
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Configuration Table */}
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gray-50/50">
          <CardTitle className="text-sm uppercase tracking-widest font-bold">
            Tiempos Objetivo por Departamento
          </CardTitle>
          <CardDescription>
            Ajusta el tiempo máximo permitido y la alerta temprana para cada columna del Kamba
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {configs.map((config) => (
              <div 
                key={config.stage} 
                className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <div className="col-span-4">
                  <p className="font-bold text-gray-900">{STAGE_LABELS[config.stage]}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-mono">{config.stage}</p>
                </div>

                <div className="col-span-3">
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Tiempo Objetivo
                  </label>
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        defaultValue={Math.floor(config.target_hours)}
                        disabled={!editMode[config.stage]}
                        className="h-9 w-16 text-right pr-6"
                        id={`target-h-${config.stage}`}
                      />
                      <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">H</span>
                    </div>
                    <span className="font-bold text-gray-300">:</span>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        defaultValue={Math.round((config.target_hours % 1) * 60)}
                        disabled={!editMode[config.stage]}
                        className="h-9 w-16 text-right pr-6"
                        id={`target-m-${config.stage}`}
                      />
                      <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">M</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Alerta Temprana
                  </label>
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        defaultValue={Math.floor(config.warning_hours)}
                        disabled={!editMode[config.stage]}
                        className="h-9 w-16 text-right pr-6"
                        id={`warning-h-${config.stage}`}
                      />
                      <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">H</span>
                    </div>
                    <span className="font-bold text-gray-300">:</span>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        defaultValue={Math.round((config.warning_hours % 1) * 60)}
                        disabled={!editMode[config.stage]}
                        className="h-9 w-16 text-right pr-6"
                        id={`warning-m-${config.stage}`}
                      />
                      <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">M</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex gap-2 justify-end">
                  {canEdit && (
                    <>
                      {editMode[config.stage] ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 h-8 px-3"
                            onClick={() => {
                              const targetH = document.getElementById(`target-h-${config.stage}`) as HTMLInputElement
                              const targetM = document.getElementById(`target-m-${config.stage}`) as HTMLInputElement
                              const warningH = document.getElementById(`warning-h-${config.stage}`) as HTMLInputElement
                              const warningM = document.getElementById(`warning-m-${config.stage}`) as HTMLInputElement
                              
                              const targetHoursCombined = parseInt(targetH.value || '0') + (parseInt(targetM.value || '0') / 60)
                              const warningHoursCombined = parseInt(warningH.value || '0') + (parseInt(warningM.value || '0') / 60)
                              
                              handleUpdate(
                                config.stage,
                                targetHoursCombined,
                                warningHoursCombined
                              )
                            }}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-3"
                            onClick={() => setEditMode(prev => ({ ...prev, [config.stage]: false }))}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3"
                          onClick={() => setEditMode(prev => ({ ...prev, [config.stage]: true }))}
                        >
                          Editar
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-xs text-blue-800 space-y-1">
          <p className="font-bold uppercase">Cómo Funciona el Tracking</p>
          <p>
            Cuando una orden avanza de columna, el sistema automáticamente registra el tiempo empleado por el usuario 
            en esa etapa. Este dato se usa para calcular el rendimiento individual y detectar cuellos de botella.
          </p>
        </div>
      </div>
    </div>
  )
}
