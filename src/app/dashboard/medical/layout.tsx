import { getUserClinic } from '@/modules/medical/actions/clinics'
import { ServiceSyncProvider } from '@/modules/medical/components/service-sync-provider'

export default async function MedicalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get user's clinic for sync provider
  const clinicResult = await getUserClinic()
  const clinicId = clinicResult.success && clinicResult.data ? clinicResult.data.id : null

  return (
    <>
      {clinicId ? (
        <ServiceSyncProvider clinicId={clinicId}>
          {children}
        </ServiceSyncProvider>
      ) : (
        children
      )}
    </>
  )
}
