import { CalendarView } from '@/modules/appointments/components/CalendarView';

export default function AppointmentsPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                 <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
                 <p className="text-muted-foreground">Gestiona las citas de la clínica.</p>
            </div>
            
            <CalendarView />
        </div>
    );
}
