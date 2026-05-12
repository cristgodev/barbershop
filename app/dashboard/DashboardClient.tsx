'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { useTranslation } from '../contexts/LanguageContext'
import PageTour from './PageTour'

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
    avatarUrl?: string | null;
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
    const { t, locale } = useTranslation()

    const [selectedBarberId, setSelectedBarberId] = useState<string>(currentUserRole === 'OWNER' ? 'ALL' : currentUserId)
    const [isCancelling, setIsCancelling] = useState<string | null>(null)
    const [isNoShowing, setIsNoShowing] = useState<string | null>(null)
    const [isCompleting, setIsCompleting] = useState<string | null>(null)
    const [selectedApt, setSelectedApt] = useState<{ id: string, title: string, barberName: string, status: string } | null>(null)

    // Calendar Custom Navigation State
    const calendarRef = useRef<any>(null)
    const [currentView, setCurrentView] = useState('listWeek')
    const [currentDateTitle, setCurrentDateTitle] = useState('')

    const changeView = (viewName: string) => {
        const api = calendarRef.current?.getApi()
        if (api) {
            api.changeView(viewName)
            setCurrentView(viewName)
        }
    }

    const handleDatesSet = (arg: any) => {
        setCurrentDateTitle(arg.view.title)
        setCurrentView(arg.view.type)
    }

    const filteredAppointments = appointments.filter(apt => {
        if (selectedBarberId === 'ALL') return true
        return apt.barber.id === selectedBarberId
    })

    const cancelAppointment = async (appointmentId: string, isNoShow: boolean = false) => {
        if (isNoShow) setIsNoShowing(appointmentId)
        else setIsCancelling(appointmentId)
        try {
            const res = await fetch('/api/appointments/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, isNoShow })
            })

            if (!res.ok) throw new Error('Failed to cancel')

            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to cancel appointment')
        } finally {
            setIsCancelling(null)
            setIsNoShowing(null)
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
                    avatarUrl: staffMembers.find(s => s.id === apt.barber.id)?.avatarUrl,
                    isCancelling: isCancelling === apt.id,
                    isCompleting: isCompleting === apt.id,
                    type: 'appointment'
                },
                backgroundColor: 'transparent',
                borderColor: 'transparent',
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

    const handleEventDropOrResize = async (changeInfo: any) => {
        const { event, revert } = changeInfo
        const { type } = event.extendedProps

        if (type !== 'appointment') {
            revert()
            return
        }

        try {
            const res = await fetch('/api/appointments/reschedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId: event.id,
                    startTime: event.start.toISOString(),
                    endTime: event.end.toISOString()
                })
            })

            if (!res.ok) {
                const errorData = await res.json()
                alert(errorData.error || 'Failed to reschedule')
                revert()
                return
            }

            router.refresh()
        } catch (error) {
            console.error('Reschedule error:', error)
            alert('Failed to reschedule appointment')
            revert()
        }
    }

    const renderEventContent = (eventInfo: any) => {
        const { status, barberName, avatarUrl, type } = eventInfo.event.extendedProps;
        const isPast = new Date(eventInfo.event.end) < new Date();
        const opacityClass = isPast && type === 'appointment' ? 'opacity-60 hover:opacity-100' : 'opacity-100';

        if (eventInfo.view.type.includes('list')) {
            return (
                <div className={`flex items-center gap-3 w-full py-1 ${opacityClass}`}>
                    {type === 'appointment' ? (
                        <>
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 border border-black/10 dark:border-white/10 shadow-sm">
                                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="" /> : (barberName ? barberName.charAt(0).toUpperCase() : 'U')}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm leading-tight text-zinc-900 dark:text-zinc-100">{eventInfo.event.title.split(' - ')[0]}</span>
                                <span className="text-xs text-zinc-500 font-medium">{eventInfo.event.title.split(' - ')[1]} • {barberName}</span>
                            </div>
                            <div className="ml-auto hidden sm:flex items-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                    status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}>{status}</span>
                            </div>
                        </>
                    ) : (
                         <span className="font-bold text-xs uppercase tracking-widest px-2 text-red-500">{eventInfo.event.title}</span>
                    )}
                </div>
            )
        }
        
        if (type === 'timeoff' || type === 'shoptimeoff') {
            return (
                <div className="flex items-center justify-center h-full w-full opacity-80">
                    <span className="font-bold text-xs uppercase tracking-widest text-center px-1">{eventInfo.event.title}</span>
                </div>
            )
        }

        if (type === 'appointment') {
            const isCompleted = status === 'COMPLETED';
            const isConfirmed = status === 'CONFIRMED';
            
            const bgClass = isCompleted 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-l-emerald-500' 
                : isConfirmed 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-l-blue-500' 
                : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 border-l-zinc-500';

            return (
                <div className={`flex flex-col p-1 h-full w-full rounded border-l-[3px] border-zinc-200 dark:border-zinc-700/50 overflow-hidden transition-all hover:bg-white dark:hover:bg-zinc-800 ${bgClass} ${opacityClass}`}>
                    <div className="flex items-start gap-1 w-full">
                        {avatarUrl ? (
                            <img src={avatarUrl} className="w-3.5 h-3.5 rounded-full object-cover shrink-0 mt-0.5 opacity-90" alt="" />
                        ) : (
                            <div className="w-3.5 h-3.5 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[7px] font-bold shrink-0 mt-0.5">
                                {barberName ? barberName.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1 leading-[1.1]">
                            <span className="font-bold text-[10px] sm:text-xs truncate">{eventInfo.timeText} • {eventInfo.event.title.split(' - ')[0]}</span>
                            <span className="text-[9px] sm:text-[10px] opacity-75 truncate">{eventInfo.event.title.split(' - ')[1]}</span>
                        </div>
                    </div>
                </div>
            )
        }
        return <div className="p-1 text-xs">{eventInfo.event.title}</div>;
    }

    return (
        <div className="space-y-6 relative">
            <PageTour 
                pageKey="schedule" 
                steps={[
                    {
                        element: '#tour-cal-filter',
                        popover: { title: 'Filtro de Equipo', description: 'Usa este selector para aislar la agenda de un solo barbero o ver a todo el equipo combinado.', side: 'bottom', align: 'start' }
                    },
                    {
                        element: '#tour-cal-grid',
                        popover: { title: 'El Lienzo de Control', description: 'Aquí residen tus reservaciones. Bloques verdes son completadas, oscuros son pendientes. Haz clic en un evento para ver detalles o cancelarlo.', side: 'top', align: 'center' }
                    }
                ]} 
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-3xl font-bold font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t('dashboard.agenda_title')}</h3>

                <div className="flex flex-wrap items-center gap-3">
                    {currentUserRole === 'OWNER' && staffMembers.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1" id="tour-cal-filter">
                            <button
                                onClick={() => setSelectedBarberId('ALL')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${selectedBarberId === 'ALL' ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                            >
                                {t('dashboard.all_barbers')}
                            </button>
                            {staffMembers.map(staff => (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedBarberId(staff.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2 ${selectedBarberId === staff.id ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'}`}
                                >
                                    {staff.avatarUrl ? (
                                        <img src={staff.avatarUrl} className="w-5 h-5 rounded-full object-cover shadow-sm" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                                            {staff.name?.charAt(0)}
                                        </div>
                                    )}
                                    {staff.name?.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <a 
                        href={`/api/calendar/sync?barberId=${selectedBarberId}`}
                        target="_blank"
                        className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
                        title="Exportar a Google Calendar, Apple, Outlook (.ics)"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>
                        <span className="hidden sm:inline">Sincronizar Calendario</span>
                        <span className="sm:hidden">Sincronizar</span>
                    </a>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] rounded-3xl p-4 sm:p-6 mb-8 transition-all relative overflow-hidden">
                {/* Abstract Glass Background glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-yellow-500/5 dark:bg-yellow-500/10 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl pointer-events-none"></div>

                {/* Custom Tailwind Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 relative z-10">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => calendarRef.current?.getApi().today()}
                            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold text-sm transition-all shadow-sm"
                        >
                            Hoy
                        </button>
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shadow-sm">
                            <button onClick={() => calendarRef.current?.getApi().prev()} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button onClick={() => calendarRef.current?.getApi().next()} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-serif ml-2 min-w-[150px] truncate text-zinc-900 dark:text-white capitalize" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                            {currentDateTitle}
                        </h2>
                    </div>

                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-xl shadow-inner w-full md:w-auto overflow-x-auto hide-scrollbar">
                        <button onClick={() => changeView('listDay')} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${currentView === 'listDay' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>Día (Lista)</button>
                        <button onClick={() => changeView('listWeek')} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${currentView === 'listWeek' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>Semana (Lista)</button>
                        <button onClick={() => changeView('timeGridWeek')} className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${currentView === 'timeGridWeek' ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>Cuadrícula</button>
                    </div>
                </div>

                <div id="tour-cal-grid" className="relative w-full z-10">
                    <style>{`
                        /* General Overrides */
                        .fc { font-family: inherit; }
                        
                        /* Hide Default Header completely since we built a custom one */
                        .fc-header-toolbar { display: none !important; }
                        
                        /* Backgrounds & Borders blending with Page */
                        .fc-theme-standard .fc-scrollgrid { border: none !important; }
                        .fc-theme-standard th { border: none !important; border-bottom: 1px solid rgba(0,0,0,0.03) !important; padding: 12px 0 !important; background: transparent !important; }
                        .fc-theme-standard td { border: none !important; } /* REMOVED VERTICAL BORDERS */

                        /* Header Cells */
                        .fc .fc-col-header-cell { background: transparent !important; }
                        .fc-col-header-cell-cushion { padding: 4px 8px !important; color: #52525b !important; font-weight: 800 !important; font-size: 0.85rem; letter-spacing: 0.05em; text-decoration: none !important; text-transform: capitalize; }
                        
                        /* Today column header highlight */
                        .fc-day-today .fc-col-header-cell-cushion { 
                            color: #18181b !important; 
                            background-color: rgba(0,0,0,0.05);
                            border-radius: 8px;
                        }

                        /* Day numbers (Month view) */
                        .fc-daygrid-day-number { font-size: 0.85rem; font-weight: 700; color: #52525b; padding: 12px !important; text-decoration: none !important; }
                        .fc-day-today .fc-daygrid-day-number { color: #ffffff !important; background-color: #18181b; border-radius: 50%; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; margin: 4px; padding: 0 !important; }

                        /* Events base */
                        .fc-event { 
                            cursor: pointer; 
                            background: transparent !important;
                            border: none !important;
                            border-radius: 4px !important;
                            padding: 1px !important; /* Visual spacing */
                        }
                        /* We remove default internal paddings because our React component handles it */
                        .fc-v-event .fc-event-main, .fc-h-event .fc-event-main { padding: 0 !important; color: inherit; height: 100%; }
                        
                        /* Time Axis (Left column) */
                        .fc-timegrid-slot-label { font-size: 0.75rem; color: #a1a1aa; font-weight: 600; padding-right: 8px !important; }
                        .fc-timegrid-axis { border: none !important; }
                        .fc-timegrid-slot-lane { border-bottom: 1px solid rgba(0,0,0,0.03) !important; } /* KEEP HORIZONTAL LINES VERY SUBTLE */
                        
                        /* Now Indicator with glow */
                        .fc-now-indicator-line { border-color: #ef4444 !important; border-width: 2px !important; box-shadow: 0 0 8px rgba(239,68,68,0.5); }
                        .fc-now-indicator-arrow { border-color: #ef4444 !important; border-width: 6px !important; background: #ef4444; border-radius: 50%; transform: translate(-3px, -3px); }

                        /* Background Events (Recurring non-working days) - Striped Pattern */
                        .fc-bg-event { 
                            opacity: 1 !important; 
                            background: repeating-linear-gradient(
                                45deg,
                                rgba(0, 0, 0, 0.02),
                                rgba(0, 0, 0, 0.02) 10px,
                                rgba(0, 0, 0, 0.04) 10px,
                                rgba(0, 0, 0, 0.04) 20px
                            ) !important;
                        }

                        /* Multi-Month Year View */
                        .fc-multimonth { border: none !important; margin-top: 1rem; }
                        .fc-multimonth-month { padding: 0.5rem; }
                        div.fc-multimonth-title { font-size: 1.2rem !important; font-weight: 800 !important; font-family: var(--font-cormorant), serif !important; color: #18181b !important; margin-bottom: 1rem !important; text-align: center; }
                        .fc-multimonth-daygrid { border: none !important; background: transparent !important; }
                        .fc-multimonth-daygrid td { border: none !important; background: transparent !important; }
                        
                        /* Today Highlight */
                        .fc .fc-day-today { background-color: rgba(250,204,21,0.03) !important; } /* Subtle yellow tint */

                        /* ===== DARK MODE MEDIA QUERY ===== */
                        @media (prefers-color-scheme: dark) {
                            .fc-theme-standard th { border-bottom: 1px solid rgba(255,255,255,0.03) !important; }
                            .fc-theme-standard td { border: none !important; }
                            .fc-timegrid-slot-lane { border-bottom: 1px solid rgba(255,255,255,0.03) !important; }

                            .fc-col-header-cell-cushion { color: #a1a1aa !important; }
                            .fc-day-today .fc-col-header-cell-cushion { color: #ffffff !important; background-color: rgba(255,255,255,0.1); }
                            
                            .fc-daygrid-day-number { color: #a1a1aa !important; }
                            .fc-day-today .fc-daygrid-day-number { color: #18181b !important; background-color: #ffffff; }
                            
                            .fc-bg-event { 
                                background: repeating-linear-gradient(
                                    45deg,
                                    rgba(255, 255, 255, 0.01),
                                    rgba(255, 255, 255, 0.01) 10px,
                                    rgba(255, 255, 255, 0.03) 10px,
                                    rgba(255, 255, 255, 0.03) 20px
                                ) !important;
                            }

                            div.fc-multimonth-title { color: #ffffff !important; }
                            .fc .fc-day-today { background-color: rgba(255,255,255,0.02) !important; }

                            /* List View Dark Mode */
                            .fc-list-day-cushion { background-color: rgba(255,255,255,0.02) !important; color: #ffffff !important; }
                            .fc-list-event:hover td { background-color: rgba(255,255,255,0.05) !important; }
                            .fc-list { border-color: rgba(255,255,255,0.04) !important; }
                        }

                        /* List View Overrides */
                        .fc-list { border-radius: 12px; border: 1px solid rgba(0,0,0,0.06); overflow: hidden; }
                        .fc-list-day-cushion { background-color: rgba(0,0,0,0.02) !important; font-family: var(--font-cormorant), serif; font-size: 1.25rem; font-weight: 700; padding: 12px 16px !important; }
                        .fc-list-event td { padding: 8px 16px !important; border: none !important; border-bottom: 1px solid rgba(0,0,0,0.03) !important; }
                        .fc-list-event:hover td { background-color: rgba(0,0,0,0.02) !important; }
                        .fc-list-event-time { font-weight: 700 !important; color: #52525b; width: 120px !important; font-variant-numeric: tabular-nums; }
                        .fc-list-event-graphic { display: none !important; } /* Hide the default colored dot */
                        .fc-list-empty { padding: 48px !important; font-size: 1rem; color: #a1a1aa; font-weight: 500; }
                    `}</style>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[timeGridPlugin, dayGridPlugin, multiMonthPlugin, interactionPlugin, listPlugin]}
                        initialView="listWeek"
                        headerToolbar={false}
                        datesSet={handleDatesSet}
                        locale={locale}
                        events={calendarEvents}
                        eventContent={renderEventContent}
                        eventClick={handleEventClick}
                        editable={true}
                        eventDrop={handleEventDropOrResize}
                        eventResize={handleEventDropOrResize}
                        slotMinTime="07:00:00"
                        slotMaxTime="22:00:00"
                        allDaySlot={false}
                        height="75vh"
                        stickyHeaderDates={true}
                        expandRows={false}
                        slotEventOverlap={false}
                        eventMinHeight={30}
                        slotDuration="00:30:00"
                        nowIndicator={true}
                        dayMaxEvents={true}
                    />
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 pt-2 px-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-800 dark:bg-zinc-700"></div>
                    <span>{t('dashboard.status_pending')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>{t('dashboard.status_confirmed')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>{t('dashboard.status_completed')}</span>
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
                            <h3 className="text-2xl font-bold mb-4 font-serif text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{t('dashboard.modal_title')}</h3>
                            
                            <div className="space-y-3 mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('dashboard.modal_details')}</p>
                                    <p className="font-medium text-sm">{selectedApt.title}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('dashboard.modal_staff')}</p>
                                    <p className="font-medium text-sm">{selectedApt.barberName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{t('dashboard.modal_status')}</p>
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
                                            {t('dashboard.modal_add_calendar')}
                                        </a>

                                        {fullApt.barber.phone && (
                                            <a 
                                                target="_blank"
                                                rel="noopener noreferrer" 
                                                href={`https://wa.me/${fullApt.barber.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`🔔 *NUEVA RESERVA*\n\nHola ${fullApt.barber.name},\nTienes un nuevo cliente agendado.\n\n👤 Cliente: ${fullApt.customer.name || 'Guest'}\n💇‍♂️ Servicio: ${fullApt.service.name}\n📅 Fecha: ${formattedDate} a las ${formattedTime}\n\nRevisa tu Dashboard para más detalles.`)}`} 
                                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-sm border border-[#25D366]/30 text-sm font-bold text-[#25D366] bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-all active:scale-[0.98] gap-2"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                                {t('dashboard.modal_send_reminder')}
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
                                        {isCompleting === selectedApt.id ? t('dashboard.modal_processing') : t('dashboard.modal_mark_completed')}
                                    </button>
                                )}
                                
                                {selectedApt.status !== 'COMPLETED' && selectedApt.status !== 'CANCELLED' && (
                                    <button
                                        onClick={() => {
                                            if (confirm("¿Marcar inasistencia? El cliente recibirá una advertencia.")) {
                                                cancelAppointment(selectedApt.id, true)
                                                setSelectedApt(null)
                                            }
                                        }}
                                        disabled={isNoShowing === selectedApt.id}
                                        className="w-full flex justify-center items-center py-3.5 px-4 mb-3 border border-orange-200 dark:border-orange-900/50 rounded-xl shadow-sm text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/10 dark:text-orange-500 dark:hover:bg-orange-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                    >
                                        {isNoShowing === selectedApt.id ? "Procesando..." : "Marcar Inasistencia (No-Show)"}
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure?")) {
                                            cancelAppointment(selectedApt.id, false)
                                            setSelectedApt(null)
                                        }
                                    }}
                                    disabled={isCancelling === selectedApt.id}
                                    className="w-full flex justify-center items-center py-3.5 px-4 border border-red-200 dark:border-red-900/50 rounded-xl shadow-sm text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-500 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {isCancelling === selectedApt.id ? t('dashboard.modal_cancelling') : t('dashboard.modal_cancel')}
                                </button>
                                
                                <button
                                    onClick={() => setSelectedApt(null)}
                                    className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-zinc-500 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors mt-1"
                                >
                                    {t('dashboard.modal_close')}
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
