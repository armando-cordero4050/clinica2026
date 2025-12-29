import { useState, useEffect } from 'react';
import { startOfWeek, addDays, format, startOfDay, endOfDay, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppointmentsAPI } from '../api/appointments.api';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';


// Types (simplified for UI)
type AppointmentUI = {
    id: string;
    title: string;
    start_time: string;
    status: string;
    patient?: { first_name: string; last_name: string };
};

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<AppointmentUI[]>([]);
    const [loading, setLoading] = useState(false);

    // Calculate Week Days
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(startDate, i)); // Mon-Sat

    useEffect(() => {
        loadAppointments();
    }, [currentDate]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const start = startOfDay(startDate);
            const end = endOfDay(weekDays[weekDays.length - 1]);
            const data = await AppointmentsAPI.getAppointments(start, end);
            // @ts-ignore - Supabase types join fix pending
            setAppointments(data || []);
        } catch (error) {
            console.error("Failed to load appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft size={16} /></Button>
                    <span className="font-semibold text-lg capitalize">
                        {format(startDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight size={16} /></Button>
                </div>
                <div className="flex gap-2">
                     <Button onClick={loadAppointments} variant="ghost" size="icon">
                        {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                     </Button>
                     <Button>
                        <Plus className="mr-2" size={16} /> Nueva Cita
                     </Button>
                </div>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {weekDays.map((day) => (
                    <div key={day.toISOString()} className="flex flex-col gap-2 min-h-[400px] border rounded-lg bg-card text-card-foreground shadow-sm">
                        {/* Day Header */}
                        <div className={`p-3 text-center border-b font-medium ${isSameDay(day, new Date()) ? 'bg-primary/10 text-primary' : 'bg-muted/50'}`}>
                            <div className="text-sm capitalize">{format(day, 'EEEE', { locale: es })}</div>
                            <div className="text-2xl font-bold">{format(day, 'd')}</div>
                        </div>

                        {/* Appointments List */}
                        <div className="flex-1 p-2 space-y-2">
                            {appointments
                                .filter(apt => isSameDay(parseISO(apt.start_time), day))
                                .map(apt => (
                                    <div key={apt.id} className="p-2 rounded border bg-background hover:shadow-md transition-shadow text-sm cursor-pointer">
                                        <div className="font-semibold truncate">{apt.title}</div>
                                        <div className="text-xs text-muted-foreground flex justify-between">
                                            <span>{format(parseISO(apt.start_time), 'HH:mm')}</span>
                                            <StatusBadge status={apt.status} />
                                        </div>
                                        {apt.patient && (
                                            <div className="text-xs text-muted-foreground mt-1 truncate">
                                                {apt.patient.first_name} {apt.patient.last_name}
                                            </div>
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        scheduled: "bg-blue-100 text-blue-800",
        confirmed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        completed: "bg-gray-100 text-gray-800",
        no_show: "bg-orange-100 text-orange-800"
    };

    const labels: Record<string, string> = {
        scheduled: "Agendada",
        confirmed: "Confirmada",
        cancelled: "Cancelada",
        completed: "Completada",
        no_show: "No Show"
    };

    return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[status] || 'bg-gray-100'}`}>
            {labels[status] || status}
        </span>
    );
}
