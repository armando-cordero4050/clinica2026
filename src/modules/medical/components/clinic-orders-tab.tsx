import { Card, CardContent } from '@/components/ui/card'
import { Package } from 'lucide-react'

interface ClinicOrdersTabProps {
  clinicId: string
}

export function ClinicOrdersTab({ clinicId }: ClinicOrdersTabProps) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="py-12 text-center text-gray-400">
        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Historial de Órdenes</p>
        <p className="text-sm mt-1">
          Aquí aparecerán las órdenes de laboratorio de esta clínica
        </p>
        <p className="text-xs mt-2 text-gray-500">
          Clinic ID: {clinicId}
        </p>
      </CardContent>
    </Card>
  )
}
