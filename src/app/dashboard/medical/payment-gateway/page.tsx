import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PaymentGatewayPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Pasarela de Pago</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Módulo en Construcción</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">La configuración de pasarelas de pago estará disponible pronto.</p>
                </CardContent>
            </Card>
        </div>
    );
}
