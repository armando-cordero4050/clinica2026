'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Settings, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function OdooConnectionSettings() {
  const [config, setConfig] = useState({
    url: '',
    database: '',
    username: '',
    api_key: ''
  })
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('odoo_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        setConfig({
          url: data.url || '',
          database: data.database || '',
          username: data.username || '',
          api_key: data.api_key || ''
        })
        setConnectionStatus('idle')
      }
    }
    fetchConfig()
  }, [supabase])

  const handleTestConnection = async () => {
    setTesting(true)
    setConnectionStatus('idle')
    setErrorDetails('')

    // First, save config temporarily to test
    try {
      // Deactivate all existing configs using RPC
      const { data: existingConfigs } = await supabase
        .from('odoo_config')
        .select('id')
        .eq('is_active', true)

      if (existingConfigs && existingConfigs.length > 0) {
        for (const config of existingConfigs) {
          await supabase
            .from('odoo_config')
            .update({ is_active: false })
            .eq('id', config.id)
        }
      }

      const { error: insertError } = await supabase
        .from('odoo_config')
        .insert({
          url: config.url,
          database: config.database,
          username: config.username,
          api_key: config.api_key,
          is_active: true
        })

      if (insertError) {
        console.error('Error saving temp config:', insertError)
        setErrorDetails(`Error al guardar configuración temporal: ${insertError.message}\n\nDetalles: ${JSON.stringify(insertError, null, 2)}`)
        setConnectionStatus('error')
        setShowErrorModal(true)
        toast.error('Error al guardar configuración temporal')
        setTesting(false)
        return
      }

      // Now test the connection
      const { testOdooConnection } = await import('@/modules/odoo/actions/sync')
      const result = await testOdooConnection()

      console.log('Odoo connection test result:', result)

      if (result.success) {
        setConnectionStatus('success')
        setErrorDetails('')
        toast.success(result.message)
      } else {
        setConnectionStatus('error')
        setErrorDetails(result.message)
        setShowErrorModal(true)
        toast.error('Error de conexión con Odoo')
        console.error('Odoo connection error:', result.message)
      }
    } catch (error: any) {
      setConnectionStatus('error')
      const errorMsg = error?.message || 'Error desconocido'
      setErrorDetails(errorMsg)
      setShowErrorModal(true)
      toast.error(`Error: ${errorMsg}`)
      console.error('Connection test error:', error)
    } finally {
      setTesting(false)
    }
  }

  const handleSaveConfig = async () => {
    if (!config.url || !config.database || !config.username || !config.api_key) {
      toast.error('Todos los campos son obligatorios')
      return
    }

    setSaving(true)

    try {
      // Deactivate all existing configs
      await supabase
        .from('odoo_config')
        .update({ is_active: false })
        .eq('is_active', true)

      // Insert new config
      const { error } = await supabase
        .from('odoo_config')
        .insert({
          url: config.url,
          database: config.database,
          username: config.username,
          api_key: config.api_key,
          is_active: true
        })

      if (error) {
        toast.error('Error al guardar configuración')
        console.error(error)
      } else {
        toast.success('Configuración guardada correctamente')
        setConnectionStatus('idle')
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Conexión
            </CardTitle>
            <CardDescription>
              Ingresa las credenciales de tu instancia de Odoo
            </CardDescription>
          </div>
          {connectionStatus !== 'idle' && (
            <Badge className={connectionStatus === 'success' ? 'bg-green-600' : 'bg-red-600'}>
              {connectionStatus === 'success' ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Conectado
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Error
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="odoo-url">URL de Odoo</Label>
            <Input
              id="odoo-url"
              placeholder="https://tuempresa.odoo.com"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odoo-database">Base de Datos</Label>
            <Input
              id="odoo-database"
              placeholder="nombre_database"
              value={config.database}
              onChange={(e) => setConfig({ ...config, database: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odoo-username">Usuario</Label>
            <Input
              id="odoo-username"
              placeholder="admin@tuempresa.com"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="odoo-apikey">API Key / Contraseña</Label>
            <Input
              id="odoo-apikey"
              type="password"
              placeholder="••••••••"
              value={config.api_key}
              onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            variant="outline"
            className="gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Probando...
              </>
            ) : (
              'Probar Conexión'
            )}
          </Button>

          <Button
            onClick={handleSaveConfig}
            disabled={saving}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </Button>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <p className="font-bold mb-1">Nota de Seguridad</p>
          <p>
            Las credenciales se almacenan en la base de datos. En producción, asegúrate de encriptar el API Key.
            Puedes generar un API Key desde tu perfil de usuario en Odoo (Preferencias → Seguridad → API Keys).
          </p>
        </div>
      </CardContent>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error de Conexión con Odoo
            </DialogTitle>
            <DialogDescription>
              No se pudo establecer conexión con el servidor de Odoo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-bold text-red-900 mb-2">Detalles del Error:</p>
              <p className="text-xs text-red-700 font-mono whitespace-pre-wrap">{errorDetails}</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <p className="font-bold mb-1">Posibles Causas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>URL incorrecta o servidor no accesible</li>
                <li>Nombre de base de datos incorrecto</li>
                <li>Credenciales inválidas (usuario/contraseña)</li>
                <li>Firewall bloqueando la conexión</li>
                <li>Certificado SSL no válido (si usas HTTPS)</li>
              </ul>
            </div>
          </div>
          <Button onClick={() => setShowErrorModal(false)} className="w-full">
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
