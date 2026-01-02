import { Card, CardContent } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

interface ClinicPaymentsTabProps {
  clinicId: string
}

export function ClinicPaymentsTab({ clinicId }: ClinicPaymentsTabProps) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="py-12 text-center text-gray-400">
        <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Historial de Pagos</p>
        <p className="text-sm mt-1">
          Aquí aparecerá el estado de cuenta y pagos de esta clínica
        </p>
        <p className="text-xs mt-2 text-gray-500">
          Clinic ID: {clinicId}
        </p>
      </CardContent>
    </Card>
  )
}
