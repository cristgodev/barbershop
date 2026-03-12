'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction'

type Appointment = {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    status: string;
    service: { name: string; price: number; durationMins: number; };
    customer: { name: string | null; phone: string | null; };
    barber: { id: string; name: string | null; phone: string | null; };
}

type Staff = {
    id: string;
    name: string | null;
}

type Schedule = {
    id: string;
    dayOfWeek: number;
    isWorkingDay: boolean;
    barberId: string;
}

type TimeOff = {
    id: string;
    date: Date;
    reason: string | null;
    barberId: string;
}

type ShopTimeOff = {
    id: string;
    date: Date;
    reason: string | null;
    barbershopId: string;
}

export default function DashboardClient({
    appointments,
    staffMembers,
    currentUserRole,
    currentUserId,
    schedules,
    timeOffs,
    shopTimeOffs
}: {
    appointments: Appointment[];
    staffMembers: Staff[];
    currentUserRole: string;
    currentUserId: string;
    schedules: Schedule[];
    timeOffs: TimeOff[];
    shopTimeOffs: ShopTimeOff[];
}) {
    const router = useRouter()

    const [selectedBarberId, setSelectedBarberId] = useState<string>(currentUserRole === 'OWNER' ? 'ALL' : currentUserId)
    const [isCancelling, setIsCancelling] = useState<string | null>(null)
    const [isCompleting, setIsCompleting] = useState<string | null>(null)
    const [selectedApt, setSelectedApt] = useState<{ id: string, title: string, barberName: string, status: string } | null>(null)

    const filteredAppointments = appointments.filter(apt => {
        if (selectedBarberId === 'ALL') return true
        return apt.barber.id === selectedBarberId
    })

    const cancelAppointment = async (appointmentId: string) => {
        setIsCancelling(appointmentId)
        try {
            const res = await fetch('/api/appointments/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId })
            })

            if (!res.ok) throw new Error('Failed to cancel')

            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to cancel appointment')
        } finally {
            setIsCancelling(null)
        }
    }

    const completeAppointment = async (appointmentId: string) => {
        setIsCompleting(appointmentId)
        try {
            const res = await fetch('/api/appointments/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId })
            })

            if (!res.ok) throw new Error('Failed to complete')

            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to complete appointment')
        } finally {
            setIsCompleting(null)
        }
    }

    // Prepare events for FullCalendar
    const calendarEvents: any[] = [
        ...filteredAppointments
            .filter(app => app.status === 'PENDING' || app.status === 'CONFIRMED' || app.status === 'COMPLETED')
            .map(apt => ({
                id: apt.id,
                title: `${apt.customer.name || 'Walk-in'} - ${apt.service.name}`,
                start: new Date(apt.startTime),
                end: new Date(apt.endTime),
                extendedProps: {
                    status: apt.status,
                    barberName: apt.barber.name,
                    isCancelling: isCancelling === apt.id,
                    isCompleting: isCompleting === apt.id,
                    type: 'appointment'
                },
                backgroundColor: apt.status === 'COMPLETED' ? '#22c55e' : apt.status === 'CONFIRMED' ? '#10b981' : '#27272a',
                borderColor: apt.status === 'COMPLETED' ? '#16a34a' : apt.status === 'CONFIRMED' ? '#059669' : '#18181b',
            }))
    ]

    // Map TimeOffs
    const timeOffEvents = timeOffs
        .filter(t => selectedBarberId === 'ALL' || t.barberId === selectedBarberId)
        .map(t => {
            const date = new Date(t.date)
            // Fix timezone offset for full-day events
            const year = date.getUTCFullYear()
            const month = String(date.getUTCMonth() + 1).padStart(2, '0')
            const day = String(date.getUTCDate()).padStart(2, '0')
            
            const barberName = staffMembers.find(s => s.id === t.barberId)?.name || 'Staff'

            return {
                id: `timeoff-${t.id}`,
                title: selectedBarberId === 'ALL' ? `⛔ OFF: ${barberName}` : `⛔ DAY OFF (${t.reason || 'Personal'})`,
                start: `${year}-${month}-${day}T07:00:00`,
                end: `${year}-${month}-${day}T22:00:00`,
                allDay: false,
                display: 'block',
                backgroundColor: '#ef4444', // Red 500
                borderColor: '#dc2626', // Red 600
                textColor: 'white',
                extendedProps: { type: 'timeoff' }
            }
        })
    
    calendarEvents.push(...timeOffEvents)

    // Map ShopTimeOffs (Global Closures)
    const shopTimeOffEvents = shopTimeOffs.map(t => {
        const date = new Date(t.date)
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')

        return {
            id: `shoptimeoff-${t.id}`,
            title: `🔒 SHOP CLOSED: ${t.reason || 'Holiday'}`,
            start: `${year}-${month}-${day}T07:00:00`,
            end: `${year}-${month}-${day}T22:00:00`,
            allDay: false,
            display: 'block',
            backgroundColor: '#000000', // Black
            borderColor: '#3f3f46', // Zinc 700
            textColor: 'white',
            extendedProps: { type: 'shoptimeoff' }
        }
    })

    calendarEvents.push(...shopTimeOffEvents)

    // Add background indicator for ShopTimeOff across the whole day visually
    const shopTimeOffBackgrounds = shopTimeOffs.map(t => {
        const date = new Date(t.date)
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')

        return {
            id: `shoptimeoff-bg-${t.id}`,
            start: `${year}-${month}-${day}`,
            allDay: true,
            display: 'background',
            backgroundColor: '#fca5a5', // Red 300
        }
    })

    calendarEvents.push(...shopTimeOffBackgrounds)

    // Map Schedules (Non-working days)
    // Only show recurring grey background if a SPECIFIC barber is selected
    if (selectedBarberId !== 'ALL') {
        const barberSchedules = schedules.filter(s => s.barberId === selectedBarberId)
        const nonWorkingDays = barberSchedules.filter(s => !s.isWorkingDay).map(s => s.dayOfWeek)
        
        if (nonWorkingDays.length > 0) {
            calendarEvents.push({
                id: `schedule-off-${selectedBarberId}`,
                daysOfWeek: nonWorkingDays, // Array of DOW (0-6)
                display: 'background',
                backgroundColor: '#a1a1aa', // Zinc 400
                title: 'Out of Office'
            } as any)
        }
    }

    const handleEventClick = (clickInfo: any) => {
        if (clickInfo.event.extendedProps.type === 'timeoff' || clickInfo.event.extendedProps.type === 'shoptimeoff') {
            return; // Ignore clicks on TimeOff bubbles
        }

        const title = clickInfo.event.title
        const status = clickInfo.event.extendedProps.status
        const barberName = clickInfo.event.extendedProps.barberName

        if (status === 'PENDING' || status === 'CONFIRMED' || status === 'COMPLETED') {
            setSelectedApt({
                id: clickInfo.event.id,
                title,
                barberName,
                status
            })
        } else {
            alert(`Appointment Details:\n\n${title}\nBarber: ${barberName}\nStatus: ${status}`);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-xl font-bold">Agenda</h3>

                {currentUserRole === 'OWNER' && staffMembers.length > 1 && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-500">Ver agenda de barbero:</span>
                        <select
                            value={selectedBarberId}
                            onChange={(e) => setSelectedBarberId(e.target.value)}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-medium"
                        >
                            <option value="ALL">Todos los barberos</option>
                            {staffMembers.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="relative w-full">
                <style>{`
                    /* General Overrides */
                    .fc { font-family: inherit; }
                    .fc-toolbar-title { font-weight: 800 !important; font-size: 1.5rem !important; letter-spacing: -0.025em; color: #18181b; }
                    
                    /* Links (Fixes invisible months in Year view & day numbers) */
                    .fc a { color: inherit !important; text-decoration: none !important; }

                    /* Backgrounds & Borders blending with Page */
                    .fc-theme-standard .fc-scrollgrid { border: none !important; }
                    .fc-theme-standard th { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; padding: 4px 0 !important; background: transparent !important; }
                    .fc-theme-standard td { border: 1px solid rgba(0,0,0,0.04) !important; }

                    /* Extra Space for Toolbar */
                    .fc-header-toolbar { margin-bottom: 2rem !important; }
                    
                    /* Buttons (macOS / SaaS Style) */
                    .fc .fc-button-primary {
                        background-color: transparent !important;
                        border: 1px solid rgba(0,0,0,0.1) !important;
                        color: #52525b !important;
                        font-weight: 600 !important;
                        text-transform: capitalize !important;
                        box-shadow: none !important;
                        border-radius: 8px;
                        padding: 0.4rem 1rem;
                        transition: all 0.2s ease;
                    }
                    .fc .fc-button-primary:hover {
                        background-color: rgba(0,0,0,0.05) !important;
                        color: #18181b !important;
                    }
                    .fc .fc-button-active {
                        background-color: #18181b !important;
                        border-color: #18181b !important;
                        color: #ffffff !important;
                    }
                    
                    /* Header Cells */
                    /* Force background to transparent for the actual inner cell container too */
                    .fc .fc-col-header-cell { background: transparent !important; }
                    .fc-col-header-cell-cushion { padding: 8px 4px !important; color: #18181b !important; font-weight: 700 !important; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; text-decoration: none !important; width: 100%; display: inline-block; }
                    .fc-col-header-cell-cushion:hover { color: #18181b !important; text-decoration: none !important; }
                    
                    /* Day numbers (Month view) */
                    .fc-daygrid-day-number { font-size: 0.8rem; font-weight: 500; color: #52525b; padding: 8px !important; }

                    /* Events */
                    .fc-event { 
                        cursor: pointer; 
                        border-radius: 6px !important; 
                        padding: 2px 6px; 
                        border: none !important; 
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        transition: transform 0.1s ease;
                    }
                    .fc-event:hover { transform: scale(1.02); z-index: 10 !important; }
                    .fc-v-event .fc-event-main { color: white; }
                    .fc-event-title { font-weight: 700; font-size: 0.85rem; letter-spacing: -0.01em; }
                    .fc-event-time { font-size: 0.70rem; opacity: 0.9; margin-bottom: 3px; font-weight: 600; }
                    
                    /* Time Axis (Left column) */
                    .fc-timegrid-slot-label { font-size: 0.75rem; color: #a1a1aa; font-weight: 500; }
                    .fc-timegrid-axis { border: none !important; }
                    
                    /* Now Indicator */
                    .fc-now-indicator-line { border-color: #ef4444 !important; border-width: 2px !important; }
                    .fc-now-indicator-arrow { border-color: #ef4444 !important; border-width: 5px !important; }

                    /* Background Events (Recurring non-working days) */
                    .fc-bg-event { opacity: 0.1 !important; }

                    /* Multi-Month Year View */
                    .fc-multimonth { border: none !important; margin-top: 1rem; }
                    .fc-multimonth-month { padding: 0.5rem; }
                    
                    /* The Absolute Fix for Year View Titles */
                    div.fc-multimonth-title, 
                    div.fc-multimonth-title a, 
                    div.fc-multimonth-title span { 
                        font-size: 1.1rem !important; 
                        font-weight: 700 !important; 
                        color: #18181b !important; 
                        margin-bottom: 0.8rem !important; 
                        text-decoration: none !important; 
                        display: block;
                    }
                    
                    .fc-multimonth-daygrid { border: none !important; background: transparent !important; }
                    .fc-multimonth-daygrid td { border: none !important; background: transparent !important; }
                    
                    /* Today Highlight */
                    .fc .fc-day-today { background-color: rgba(0,0,0,0.03) !important; }

                    /* ===== DARK MODE MEDIA QUERY ===== */
                    @media (prefers-color-scheme: dark) {
                        .fc-toolbar-title { color: #ffffff !important; }
                        
                        .fc-theme-standard th { border-bottom: 1px solid rgba(255,255,255,0.08) !important; background: transparent !important; }
                        .fc-theme-standard td { border: 1px solid rgba(255,255,255,0.04) !important; background: transparent !important; }

                        .fc .fc-button-primary { border-color: rgba(255,255,255,0.1) !important; color: #a1a1aa !important; }
                        .fc .fc-button-primary:hover { background-color: rgba(255,255,255,0.05) !important; color: #ffffff !important; }
                        .fc .fc-button-active { background-color: #ffffff !important; border-color: #ffffff !important; color: #18181b !important; }

                        .fc-col-header-cell-cushion { color: #f4f4f5 !important; }
                        .fc-col-header-cell-cushion:hover { color: #ffffff !important; }
                        
                        .fc-daygrid-day-number { color: #a1a1aa !important; }
                        
                        .fc-bg-event { opacity: 0.2 !important; }

                        div.fc-multimonth-title, 
                        div.fc-multimonth-title a, 
                        div.fc-multimonth-title span { 
                            color: #ffffff !important; 
                        }

                        .fc .fc-day-today { background-color: rgba(255,255,255,0.04) !important; }
                        .fc-theme-standard .fc-scrollgrid { background: transparent !important; }
                    }
                `}</style>
                <FullCalendar
                    plugins={[timeGridPlugin, dayGridPlugin, multiMonthPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    views={{
                        multiMonthYear: { buttonText: 'Year' },
                        dayGridMonth: { buttonText: 'Month' },
                        timeGridWeek: { buttonText: 'Week' },
                        timeGridDay: { buttonText: 'Day' }
                    }}
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    slotMinTime="07:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    height="auto"
                    expandRows={true}
                    slotDuration="00:30:00"
                    nowIndicator={true}
                />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 pt-2 px-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-700"></div>
                    <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Completed / Paid</span>
                </div>
            </div>

            {/* Appointment Action Modal */}
            {selectedApt && (() => {
                const fullApt = appointments.find(a => a.id === selectedApt.id)
                const aptDate = fullApt ? new Date(fullApt.startTime) : new Date()
                const formattedDate = aptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                const formattedTime = aptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                
                return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Manage Appointment</h3>
                            
                            <div className="space-y-3 mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Details</p>
                                    <p className="font-medium text-sm">{selectedApt.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Staff Member</p>
                                    <p className="font-medium text-sm">{selectedApt.barberName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Current Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                                        selectedApt.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        selectedApt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        selectedApt.status === 'PENDING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                                    }`}>
                                        {selectedApt.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {fullApt && (
                                    <>
                                        <a 
                                            href={`/api/appointments/${fullApt.id}/calendar`}
                                            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-[0.98] gap-2"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                                            Add to Calendar
                                        </a>

                                        {fullApt.barber.phone && (
                                            <a 
                                                target="_blank"
                                                rel="noopener noreferrer" 
                                                href={`https://wa.me/${fullApt.barber.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`🔔 *NUEVA RESERVA*\n\nHola ${fullApt.barber.name},\nTienes un nuevo cliente agendado.\n\n👤 Cliente: ${fullApt.customer.name || 'Guest'}\n💇‍♂️ Servicio: ${fullApt.service.name}\n📅 Fecha: ${formattedDate} a las ${formattedTime}\n\nRevisa tu Dashboard para más detalles.`)}`} 
                                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm border border-[#25D366]/30 text-sm font-bold text-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-all active:scale-[0.98] gap-2"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                                Send Reminder (Barber)
                                            </a>
                                        )}
                                        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                                    </>
                                )}
                                {selectedApt.status !== 'COMPLETED' && (
                                    <button
                                        onClick={() => {
                                            completeAppointment(selectedApt.id)
                                            setSelectedApt(null)
                                        }}
                                        disabled={isCompleting === selectedApt.id}
                                        className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                    >
                                        {isCompleting === selectedApt.id ? 'Processing...' : 'Mark as Completed / Paid'}
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => {
                                        if (confirm('Are you certain you want to cancel this appointment?')) {
                                            cancelAppointment(selectedApt.id)
                                            setSelectedApt(null)
                                        }
                                    }}
                                    disabled={isCancelling === selectedApt.id}
                                    className="w-full flex justify-center items-center py-3.5 px-4 border border-red-200 dark:border-red-900/50 rounded-xl shadow-sm text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-500 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {isCancelling === selectedApt.id ? 'Cancelling...' : 'Cancel Appointment'}
                                </button>
                                
                                <button
                                    onClick={() => setSelectedApt(null)}
                                    className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-zinc-500 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors mt-1"
                                >
                                    Close without changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                )
            })()}
        </div>
    )
}
