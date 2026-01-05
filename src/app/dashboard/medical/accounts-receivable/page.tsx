import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AccountsReceivablePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Cuentas por Cobrar</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Módulo en Construcción</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">La gestión de cuentas por cobrar estará disponible pronto.</p>
                </CardContent>
            </Card>
        </div>
    );
}
