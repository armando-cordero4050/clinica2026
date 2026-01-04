import { Odontogram } from '@/modules/medical/components/odontogram'
import { getPatient } from '@/modules/medical/actions/patients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, History } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata = {
  title: 'Evolución Clínica | DentalFlow',
  description: 'Gestión clínica y odontograma',
}

export default async function ClinicalEvolutionPage({ params }: { params: { id: string } }) {
  const patientResult = await getPatient(params.id)

  if (!patientResult.success || !patientResult.data) {
    notFound()
  }

  const patient = patientResult.data

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evolución Clínica</h1>
          <p className="text-muted-foreground">
            Paciente: <span className="font-semibold text-foreground">{patient.first_name} {patient.last_name}</span>
          </p>
        </div>
        <div className="flex gap-2">
            <Link href={`/dashboard/medical/patients`}>
                <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver a Pacientes
                </Button>
            </Link>
        </div>
      </div>

      <Tabs defaultValue="odontogram" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="odontogram">Odontograma</TabsTrigger>
            <TabsTrigger value="history">Historial de Evoluciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="odontogram" className="mt-4">
            <Odontogram patientId={patient.id} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Historial Clínico
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <History className="w-12 h-12 mb-4 opacity-20" />
                        <p>El historial de evoluciones estará disponible próximamente.</p>
                        <p className="text-xs">Podrás ver notas, diagnósticos y tratamientos pasados.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
