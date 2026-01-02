'use client'

import { useState } from 'react'
import { syncServicesFromOdoo } from '@/modules/admin/actions/services'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function SyncServicesButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        setLoading(true)
        toast.info("Iniciando sincronización de servicios con Odoo...")
        
        try {
            const result = await syncServicesFromOdoo()
            if (result.success) {
                toast.success(result.message)
                router.refresh()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("Error inesperado al sincronizar")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button 
            onClick={handleSync} 
            disabled={loading}
            variant="outline"
            className="gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? 'Sincronizando...' : 'Sincronizar Productos'}
        </Button>
    )
}
