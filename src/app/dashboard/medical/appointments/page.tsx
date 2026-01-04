import { getAppointments } from '@/modules/medical/actions/appointments'
import CalendarView from './calendar-view'
import { startOfWeek, endOfWeek, addDays } from 'date-fns'

export default async function AppointmentsPage() {
  // Ideally, this date range comes from searchParams. 
  // For Sprint Zero MVP, we fetch the current week + next 2 weeks to cover demo data.
  const today = new Date()
  const start = startOfWeek(addDays(today, -7)) // Include last week
  const end = endOfWeek(addDays(today, 14)) // Include next 2 weeks
  
  const result = await getAppointments(start, end)
  const appointments = result.success ? result.data : []

  return (
    <div className="container mx-auto py-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage patient visits.</p>
        </div>
      </div>
      
      <div className="flex-1">
        <CalendarView appointments={appointments || []} />
      </div>
    </div>
  )
}
