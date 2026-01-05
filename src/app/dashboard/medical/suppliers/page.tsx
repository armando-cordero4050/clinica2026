import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SuppliersPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Proveedores</h1>
                    <p className="text-gray-500">Gestión de proveedores de insumos y servicios dentales.</p>
                </div>
                <div className="flex gap-3">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
                    </Button>
                </div>
            </div>

            {/* KPIs Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
                        <Truck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">En tránsito</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                        <Truck className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">Facturas por vencer</p>
                    </CardContent>
                </Card>
            </div>

            {/* Listado Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Directorio de Proveedores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full mb-4 max-w-sm items-center space-x-2">
                        <Input type="text" placeholder="Buscar proveedor..." />
                        <Button size="icon" variant="secondary">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50 text-gray-400">
                        <p>No hay proveedores registrados aún.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
