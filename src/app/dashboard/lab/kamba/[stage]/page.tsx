import { getGlobalKamba } from '@/modules/lab/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Clock, Monitor, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'

const STAGE_LABELS: Record<string, string> = {
  'clinic_pending': '1. Clínica Pendiente',
  'digital_picking': '2. Picking Digital',
  'income_validation': '3. Validación Ingresos',
  'gypsum': '4. Yesos',
  'design': '5. Diseño',
  'client_approval': '6. Aprobación Cliente',
  'nesting': '7. Nesting',
  'production_man': '8. MAN',
  'qa': '9. Control de Calidad',
  'billing': '10. Facturar',
  'delivery': '11. Delivery'
}

export default async function StageDetailPage({ params }: { params: { stage: string } }) {
  const allOrders = await getGlobalKamba()
  const stageOrders = allOrders.filter(o => o.status === params.stage)
  const stageLabel = STAGE_LABELS[params.stage] || params.stage

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/lab/kamba">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stageLabel}</h1>
            <p className="text-sm text-muted-foreground">{stageOrders.length} órdenes en esta etapa</p>
          </div>
        </div>
        <Badge className="bg-blue-600 px-3 py-1">
          Etapa de Producción
        </Badge>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-sm uppercase tracking-wider font-bold text-gray-500">
            Listado Detallado de Órdenes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Orden</TableHead>
                <TableHead>Clínica</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado SLA</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stageOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-400 italic">
                    No hay órdenes en esta etapa actualmente.
                  </TableCell>
                </TableRow>
              ) : (
                stageOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold text-blue-600">
                      {order.order_number || '#'+order.id.slice(0,6)}
                    </TableCell>
                    <TableCell className="font-medium">{order.clinic_name}</TableCell>
                    <TableCell>{order.doctor_name || 'Dr. ---'}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate font-bold text-gray-700">
                        {order.product_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>SLA: {order.sla_hours || 48}h</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.is_digital ? (
                        <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 flex items-center gap-1 w-fit">
                          <Monitor className="h-3 w-3" /> Digital
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 flex items-center gap-1 w-fit">
                          <ClipboardCheck className="h-3 w-3" /> Físico
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href="/dashboard/lab/kamba">
                          <Button variant="outline" size="sm" className="h-8 text-[11px]">
                             Gestionar en Kamba
                          </Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
