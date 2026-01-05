'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Package } from 'lucide-react'
import { getLabMaterials, getLabConfigurations } from '@/modules/core/lab-materials/actions'

interface MaterialSelectionProps {
    initialData: any
    onNext: (data: any) => void
}

export function MaterialSelection({ initialData, onNext }: MaterialSelectionProps) {
    const [materials, setMaterials] = useState<any[]>([])
    const [configurations, setConfigurations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Selection State
    const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null)
    const [selectedConfig, setSelectedConfig] = useState<any | null>(null)

    useEffect(() => {
        const load = async () => {
            const res = await getLabMaterials()
            if (!res.success) {
                setError(res.error || 'Error cargando materiales')
            } else if (res.data) {
                setMaterials(res.data)
            }
            setLoading(false)
        }
        load()
    }, [])

    useEffect(() => {
        if (selectedMaterial) {
            const loadConfigs = async () => {
                const res = await getLabConfigurations(selectedMaterial.id)
                if (res.success && res.data) {
                    setConfigurations(res.data)
                }
            }
            loadConfigs()
        } else {
            setConfigurations([])
        }
    }, [selectedMaterial])

    const handleNext = () => {
        if (!selectedConfig) return
        onNext({
            temp_selected_config: selectedConfig
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (error) {
        return <div className="text-destructive p-4">Error: {error}</div>
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Selecciona el Material</h2>
                <p className="text-muted-foreground">Elige el tipo de material para la prótesis.</p>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {materials.map((mat) => (
                   <Card 
                     key={mat.id} 
                     className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                         selectedMaterial?.id === mat.id ? 'border-primary bg-primary/5' : 'border-transparent'
                     }`}
                     onClick={() => {
                         setSelectedMaterial(mat)
                         setSelectedConfig(null)
                     }}
                   >
                       <CardContent className="p-6 text-center space-y-2">
                           <Package className="h-8 w-8 mx-auto text-primary" />
                           <h3 className="font-semibold text-lg">{mat.name}</h3>
                           {mat.description && (
                               <p className="text-xs text-muted-foreground">{mat.description}</p>
                           )}
                       </CardContent>
                   </Card>
               ))}
            </div>

            {/* Configurations */}
            {selectedMaterial && configurations.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-medium">Configuración de {selectedMaterial.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {configurations.map((config) => (
                            <Card
                                key={config.id}
                                className={`cursor-pointer transition-all hover:shadow-sm border ${
                                    selectedConfig?.id === config.id 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedConfig(config)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{config.name}</h4>
                                            {config.code && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Código: {config.code}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">Q{config.base_price.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">{config.sla_days} días</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-8">
                <Button onClick={handleNext} disabled={!selectedConfig} size="lg">
                    Siguiente
                </Button>
            </div>
        </motion.div>
    )
}
