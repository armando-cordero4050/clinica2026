import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reportes Generales</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Módulo en Construcción</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">El centro de reportes avanzados estará disponible pronto.</p>
                </CardContent>
            </Card>
        </div>
    );
}
