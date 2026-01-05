import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function CashierPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Caja y Cobros</h1>
                    <p className="text-gray-500">Gestión de pagos y transacciones del día.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Cierre de Caja</Button>
                    <Button>Nuevo Cobro</Button>
                </div>
            </div>

            {/* KPIs Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">+0% desde ayer</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Operaciones registradas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
                        <DollarSign className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">En tratamientos finalizados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Buscador de Pacientes para Cobro */}
            <Card>
                <CardHeader>
                    <CardTitle>Búsqueda Rápida</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input type="text" placeholder="Buscar paciente por nombre o DPI..." />
                        <Button size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center py-10 text-gray-400">
                <p>Módulo de Caja en construcción.</p>
            </div>
        </div>
    );
}
