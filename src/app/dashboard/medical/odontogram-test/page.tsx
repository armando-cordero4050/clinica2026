import { Odontogram } from '@/modules/medical/components/odontogram'

export const metadata = {
  title: 'Odontograma | DentalFlow',
  description: 'Odontograma interactivo del paciente',
}

export default function OdontogramTestPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Odontograma Interactivo</h1>
        <p className="text-muted-foreground">
          Sistema FDI con todas las superficies dentales
        </p>
      </div>

      <Odontogram patientId="test-patient" />
    </div>
  )
}
