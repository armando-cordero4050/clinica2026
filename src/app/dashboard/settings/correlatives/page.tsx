'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Hash, Save, RefreshCcw, Settings2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Sequence {
  code: string
  prefix: string
  next_value: number
}

export default function CorrelativesPage() {
  const [loading, setLoading] = useState(true)
  const [sequences, setSequences] = useState<Sequence[]>([])
  
  const supabase = createClient()

  const fetchSequences = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_sequences')
    
    if (error) {
      console.error('Error fetching sequences:', error)
    } else if (data) {
      setSequences(data as Sequence[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSequences()
  }, [fetchSequences])

  const handleUpdate = async () => {
    const prefixInput = document.getElementById('prefix-input') as HTMLInputElement
    const nextValueInput = document.getElementById('nextvalue-input') as HTMLInputElement
    
    const { error } = await supabase.rpc('update_sequence_config', {
      p_code: 'lab_order',
      p_prefix: prefixInput.value,
      p_next_value: parseInt(nextValueInput.value)
    })
    
    if (error) {
      toast.error('Error al actualizar correlativo')
      console.error('Update error:', error)
    } else {
      toast.success('Correlativo actualizado correctamente')
      fetchSequences()
    }
  }

  return (
    <div className="space-y-6 container max-w-4xl py-6">
      <div className="flex items-center gap-3">
         <Settings2 className="h-8 w-8 text-blue-600" />
         <div>
            <h1 className="text-2xl font-bold">Configuración de Correlativos</h1>
            <p className="text-muted-foreground italic">Define el formato y el siguiente número para tus documentos core.</p>
         </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-gray-50/50 rounded-t-xl">
           <CardTitle className="text-sm uppercase tracking-widest font-bold flex items-center gap-2">
              <Hash className="h-4 w-4" /> Numeración de Órdenes (Laboratorio)
           </CardTitle>
           <CardDescription>
              Controla el prefijo y el valor inicial de tus órdenes globales.
           </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-400 uppercase">Prefijo</label>
                 <Input 
                   id="prefix-input"
                   defaultValue={sequences.length > 0 ? sequences[0].prefix : 'ORD-'} 
                   placeholder="Ej. LAB-" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-400 uppercase">Siguiente Valor</label>
                 <Input 
                   id="nextvalue-input"
                   type="number" 
                   defaultValue={sequences.length > 0 ? sequences[0].next_value : 1001} 
                 />
              </div>
              <div className="flex gap-2">
                 <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleUpdate}>
                    <Save className="h-4 w-4" /> Guardar
                 </Button>
                 <Button variant="outline" size="icon" className="text-gray-400" onClick={fetchSequences} disabled={loading}>
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
              </div>
           </div>

           <div className="mt-8 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                 <span className="text-xs text-blue-600 font-bold uppercase">Vista Previa de Orden</span>
                 <p className="text-lg font-mono font-bold text-blue-800">
                   {sequences.length > 0 ? `${sequences[0].prefix}${sequences[0].next_value}` : 'ORD-1001'}
                 </p>
              </div>
              <Badge className="bg-blue-600">Activo</Badge>
           </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
         <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
         <div className="text-xs text-amber-800 space-y-1">
            <p className="font-bold uppercase">Nota Importante</p>
            <p>Cambiar el &quot;Siguiente Valor&quot; manualmente puede causar errores si intentas usar un número que ya existe en la base de datos.</p>
         </div>
      </div>
    </div>
  )
}
