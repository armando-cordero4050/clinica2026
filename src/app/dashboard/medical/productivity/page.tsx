import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ProductivityPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Análisis de Productividad</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Módulo en Construcción</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Los dashboards de productividad estarán disponibles pronto.</p>
                </CardContent>
            </Card>
        </div>
    );
}
