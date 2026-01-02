'use client'

import { useState } from 'react'
import { Appointment } from './actions'
import { format, addDays, startOfWeek, endOfWeek, isSameDay, addMinutes, differenceInMinutes, startOfDay, getHours, getMinutes } from 'date-fns'
import { es } from 'date-fns/locale' // Import Spanish locale
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Plus, Printer, Settings, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { NewAppointmentModal } from './new-appointment-modal'
import { EditAppointmentModal } from './edit-appointment-modal'

// Configuration
const START_HOUR = 8 // 8 AM
const END_HOUR = 19 // 7 PM
const CELL_HEIGHT = 60 // 60px per hour
const COLUMNS_COUNT = 6 // Mon - Sat

export default function CalendarView({ appointments }: { appointments: Appointment[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Generate Week Days (Mon-Sat)
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: COLUMNS_COUNT }).map((_, i) => addDays(startDate, i))

  // Time Slots
  const timeSlots = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => START_HOUR + i)

  // Navigation
  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7))
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7))

  // Helper: Position Event
  const getEventStyle = (apt: Appointment) => {
    const start = new Date(apt.start_time)
    const end = new Date(apt.end_time)
    
    const startMinutes = (getHours(start) * 60) + getMinutes(start)
    const endMinutes = (getHours(end) * 60) + getMinutes(end)
    const dayStartMinutes = START_HOUR * 60

    const top = ((startMinutes - dayStartMinutes) / 60) * CELL_HEIGHT
    const height = ((endMinutes - startMinutes) / 60) * CELL_HEIGHT

    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.start_time), day))
  }

  // Capitalize first letter helper
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="flex h-full gap-4 bg-white p-2">
        {/* MAIN CALENDAR (Now on Left) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100 px-2">
                <div className="flex items-center gap-4">
                     {/* Navigation */}
                    <div className="flex items-center gap-1 text-teal-600">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-teal-50 hover:text-teal-700" onClick={handlePrevWeek}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-teal-50 hover:text-teal-700" onClick={() => setCurrentDate(new Date())}>
                            <CalendarIcon className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-teal-50 hover:text-teal-700" onClick={handleNextWeek}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                         <Button variant="outline" className="ml-2 text-teal-600 border-teal-200 hover:bg-teal-50 h-8 text-xs font-medium px-3" onClick={() => setCurrentDate(new Date())}>
                            Hoy
                        </Button>
                    </div>

                    {/* Date Range Text */}
                    <h2 className="text-gray-600 text-sm font-medium">
                        {format(startDate, 'd MMM', { locale: es })} - {format(addDays(startDate, 6), 'd MMM yyyy', { locale: es })}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Filters (Mock) */}
                    <div className="flex items-center border rounded-md px-2 py-1 bg-white shadow-sm">
                         <span className="text-xs text-gray-500 mr-2">Estado</span>
                         <span className="text-sm font-medium text-gray-700">Todos</span>
                         <ChevronLeft className="w-3 h-3 rotate-270 ml-2" />
                    </div>

                    <div className="flex gap-1">
                        <Button variant="outline" size="icon" className="h-9 w-9 text-gray-500 border-gray-200">
                            <CalendarIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 text-gray-500 border-gray-200">
                             <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 text-gray-500 border-gray-200">
                             <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto relative flex mt-2">
                {/* Time Labels Column */}
                <div className="w-14 flex-shrink-0 bg-white sticky left-0 z-20">
                    <div className="h-16"></div> {/* Header spacer matches day header */}
                    {timeSlots.map(hour => (
                        <div key={hour} className="border-b border-transparent text-[11px] text-gray-400 font-normal text-right pr-3 relative -top-2.5" style={{ height: `${CELL_HEIGHT}px` }}>
                            {hour > 12 ? `${hour - 12} p. m.` : `${hour} a. m.`}
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                <div className="flex-1 grid grid-cols-6 min-w-[800px]">
                     {weekDays.map((day, dayIndex) => {
                        const isToday = isSameDay(day, new Date())
                        const dayEvents = getAppointmentsForDay(day)

                         return (
                            <div key={dayIndex} className="flex flex-col border-l border-gray-100 last:border-r">
                                {/* Day Header */}
                                <div className="h-16 border-b border-gray-100 flex flex-col items-center justify-center sticky top-0 bg-white z-10 pb-2">
                                    <span className={`text-[11px] font-semibold uppercase mb-1 ${isToday ? 'text-teal-600' : 'text-teal-600'}`}>
                                        {format(day, 'EEEE', { locale: es })}
                                    </span>
                                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold duration-200 ${isToday ? 'bg-teal-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                                        {format(day, 'd')}
                                    </div>
                                </div>

                                {/* Day Grid Cells */}
                                <div className="relative flex-1 bg-white">
                                    {/* Grid Lines */}
                                    {timeSlots.map((hour, i) => (
                                        <div 
                                            key={i} 
                                            className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors" 
                                            style={{ height: `${CELL_HEIGHT}px` }}
                                            onClick={() => {
                                                const d = new Date(day)
                                                d.setHours(hour)
                                                d.setMinutes(0)
                                                setSelectedDate(d)
                                                setIsModalOpen(true)
                                            }}
                                        ></div>
                                    ))}

                                    {/* Events Layer */}
                                    {dayEvents.map(apt => (
                                        <div
                                            key={apt.id}
                                            className={`absolute left-1 right-1 rounded-[3px] text-xs p-1.5 shadow-sm cursor-pointer overflow-hidden border-l-[4px] transition-all z-10
                                            ${apt.status === 'confirmed' ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-500' : 
                                              apt.status === 'completed' ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-500' :
                                              apt.status === 'cancelled' ? 'bg-red-100 hover:bg-red-200 text-red-800 border-red-500' :
                                              'bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-500'
                                            }`}
                                            style={getEventStyle(apt)}
                                        onClick={() => {
                                            setSelectedAppointment(apt)
                                            setIsEditModalOpen(true)
                                        }}
                                        >
                                            <div className="font-medium truncate text-[11px] leading-tight">{apt.patient_name}</div>
                                        </div>
                                    ))}
                                    
                                    {/* Current Time Line */}
                                    {isToday && (
                                        <div 
                                            className="absolute w-full border-t border-red-400 z-30 pointer-events-none opacity-60"
                                            style={{ top: `${((getHours(new Date()) * 60 + getMinutes(new Date()) - (START_HOUR * 60)) / 60) * CELL_HEIGHT}px` }}
                                        />
                                    )}
                                </div>
                            </div>
                         )
                     })}
                </div>
            </div>
        </div>

        {/* SIDEBAR (Now on Right, Matches Screenshot) */}
        <div className="w-72 bg-white hidden md:flex flex-col pl-4 pt-4 border-l border-gray-50">
            <div className="flex items-center justify-between mb-4">
                 <span className="text-xs text-gray-400 font-medium">Todas las agendas</span>
                 {/* Mock Toggle */}
                 <div className="w-8 h-4 bg-gray-200 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute left-0 border border-gray-200"></div>
                 </div>
            </div>

            <div className="space-y-3 mb-8">
                 {/* Active User */}
                 <div className="flex items-center justify-between w-full p-2 bg-blue-500 text-white rounded-full shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="flex items-center gap-2 pl-1">
                        <div className="w-5 h-5 bg-white text-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>
                        <span className="text-sm font-medium">jorge cordero</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 mr-2 opacity-50" />
                </div>

                {/* Specialists */}
                 <div className="flex items-center justify-between w-full p-2 bg-pink-500 text-white rounded-full shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="flex items-center gap-2 pl-1">
                        <div className="w-5 h-5 border border-white rounded-full flex items-center justify-center text-[10px]"></div>
                        <span className="text-sm font-medium">Especialistas</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 mr-2 opacity-50" />
                </div>
            </div>

             <Button 
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-full shadow-none border border-gray-200"
                onClick={() => {
                    setSelectedDate(new Date())
                    setIsModalOpen(true)
                }}
            >
                <Plus className="w-4 h-4 mr-2" /> Agregar
            </Button>
            
            {/* Floating Action Button (Screenshot has Chat icon bottom right) */}
             <div className="mt-auto flex justify-end pb-4">
                 <Button className="h-12 w-12 rounded-full bg-teal-600 hover:bg-teal-700 shadow-lg text-white p-0 flex items-center justify-center">
                    <span className="sr-only">Chat</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                 </Button>
             </div>
        </div>

        <NewAppointmentModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            defaultDate={selectedDate}
        />

        <EditAppointmentModal 
            isOpen={isEditModalOpen}
            onClose={() => {
                setIsEditModalOpen(false)
                setSelectedAppointment(null)
            }}
            appointment={selectedAppointment}
        />
    </div>
  )
}
