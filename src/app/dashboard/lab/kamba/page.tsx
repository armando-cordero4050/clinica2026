import { getGlobalKamba } from '@/modules/lab/actions'
import { GlobalKamba } from '@/modules/lab/components/global-kamba'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Layers } from 'lucide-react'

export default async function LabKambaPage() {
  const supabase = await createClient()
  const { data: profile } = await supabase.rpc('get_my_profile')
  const userRole = profile?.role || 'lab_staff'
  
  const orders = await getGlobalKamba()

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
             <Layers className="h-8 w-8 text-blue-600" />
             Kamba Logística
             <Badge variant="outline" className="text-[10px] uppercase bg-white">{userRole}</Badge>
          </h1>
          <p className="text-muted-foreground mt-1">Gestión global de producción en 11 etapas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <GlobalKamba initialOrders={orders} userRole={userRole} />
      </div>
    </div>
  )
}
