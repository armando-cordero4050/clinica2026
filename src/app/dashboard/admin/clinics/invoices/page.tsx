import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Receipt, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

async function getInvoices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clinic_invoices')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
     console.error("Error fetching invoices:", error)
     return []
  }
  return data
}

export default async function InvoicePage() {
  const invoices = await getInvoices()

  const totalAmount = invoices.reduce((sum: number, inv: any) => sum + (Number(inv.total_amount) || 0), 0)
  const pendingAmount = invoices.reduce((sum: number, inv: any) => sum + (Number(inv.amount_residual) || 0), 0)
  const paidCount = invoices.filter((inv: any) => inv.payment_state === 'paid').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Facturas Clínicas</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrendingUp className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 uppercase tracking-wider">Facturación Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Q {totalAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs mt-1 opacity-75">Historico de ventas sincronizado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-lg overflow-hidden relative">
           <div className="absolute top-0 right-0 p-4 opacity-20">
            <AlertCircle className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 uppercase tracking-wider">Saldo Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Q {pendingAmount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs mt-1 opacity-75">Monto por cobrar de clínicas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <CheckCircle2 className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 uppercase tracking-wider">Facturas Pagadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{paidCount}</div>
            <p className="text-xs mt-1 opacity-75">Saldadas completamente</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Receipt className="h-5 w-5 text-blue-500" />
            Detalle de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>No. Factura</TableHead>
                <TableHead>Clínica</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                    No se han encontrado facturas sincronizadas.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv: any) => (
                  <TableRow key={inv.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-bold text-blue-600">{inv.invoice_number}</TableCell>
                    <TableCell className="font-medium text-gray-700">{inv.clinic_name || 'Desconocida'}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {format(new Date(inv.date), 'dd MMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      Q {Number(inv.total_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-amber-600">
                      Q {Number(inv.amount_residual).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={inv.payment_state === 'paid' ? 'default' : 'secondary'}
                        className={inv.payment_state === 'paid' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}
                      >
                        {inv.payment_state === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Badge>
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
