'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Service = { id: string; name: string; price: number; durationMins: number }
type Staff = { id: string; name: string | null; role: string; avatarUrl?: string | null }
type Schedule = { barberId: string; dayOfWeek: number; startTime: string; endTime: string; isWorkingDay: boolean }
type TimeOff = { barberId: string; date: Date }
type ShopTimeOff = { barbershopId: string; date: Date }
type Appointment = { barberId: string; date: Date; startTime: Date; service: { durationMins: number } }

export default function BookingForm({
    shopId,
    services,
    staff,
    schedules,
    timeOffs,
    shopTimeOffs,
    appointments,
    customerId
}: {
    shopId: string;
    services: Service[];
    staff: Staff[];
    schedules: Schedule[];
    timeOffs: TimeOff[];
    shopTimeOffs: ShopTimeOff[];
    appointments?: Appointment[];
    customerId: string | null;
}) {
    const router = useRouter()

    const [selectedService, setSelectedService] = useState('')
    const [selectedBarber, setSelectedBarber] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')

    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [minDate, setMinDate] = useState('')

    useEffect(() => {
        setMinDate(new Date().toISOString().split('T')[0])
    }, [])

    useEffect(() => {
        if (staff.length === 1) {
            setSelectedBarber(staff[0].id)
        }
    }, [staff])

    // Generar opciones para los prox 14 dias
    const next14Days = useMemo(() => {
        const days = []
        const today = new Date()
        for (let i = 0; i < 14; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            // Fix timezone issue when splitting ISO string
            const offset = d.getTimezoneOffset()
            const adjustedDate = new Date(d.getTime() - (offset*60*1000))
            days.push(adjustedDate.toISOString().split('T')[0])
        }
        return days
    }, [])

    const isShopOpenOnDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number)
        // Ensure we parse the date string correctly considering local timezone
        const dateObj = new Date(y, m - 1, d)
        
        // Check shop time offs
        const isShopOff = shopTimeOffs.some(stOff => {
            const offDate = new Date(stOff.date)
            return offDate.getDate() === dateObj.getDate() &&
                   offDate.getMonth() === dateObj.getMonth() &&
                   offDate.getFullYear() === dateObj.getFullYear()
        })

        return !isShopOff
    }

    const checkDateAvailability = (dateStr: string) => {
        if (!selectedBarber || !isShopOpenOnDate(dateStr)) return false
        
        const [y, m, d] = dateStr.split('-').map(Number)
        const dateObj = new Date(y, m - 1, d)
        const dayOfWeek = dateObj.getDay()
        
        const daySchedule = schedules.find(s => s.barberId === selectedBarber && s.dayOfWeek === dayOfWeek)
        if (!daySchedule || !daySchedule.isWorkingDay) return false

        // Check if barber has time off
        const isOff = timeOffs.some(tOff => {
            const offDate = new Date(tOff.date)
            return tOff.barberId === selectedBarber && 
                   offDate.getDate() === dateObj.getDate() &&
                   offDate.getMonth() === dateObj.getMonth() &&
                   offDate.getFullYear() === dateObj.getFullYear()
        })
        
        return !isOff
    }

    const availableTimeSlots = useMemo(() => {
        if (!selectedBarber || !selectedDate || !selectedService) return []

        const [y, m, d] = selectedDate.split('-').map(Number)
        const dateObj = new Date(y, m - 1, d)
        const dayOfWeek = dateObj.getDay()

        const daySchedule = schedules.find(s => s.barberId === selectedBarber && s.dayOfWeek === dayOfWeek)
        if (!daySchedule) return []

        const service = services.find(s => s.id === selectedService)
        if (!service) return []

        const durationMinutes = service.durationMins
        const slots: string[] = []

        // Parse start and end times
        const [startHr, startMin] = daySchedule.startTime.split(':').map(Number)
        const [endHr, endMin] = daySchedule.endTime.split(':').map(Number)

        let currentMins = startHr * 60 + startMin
        const endDayMins = endHr * 60 + endMin

        // Create a local date corresponding to the selected date 
        // to properly compare with appointment start/end times
        const baseDate = new Date(y, m - 1, d)

        while (currentMins + durationMinutes <= endDayMins) {
            const hr = Math.floor(currentMins / 60)
            const min = currentMins % 60
            const timeStr = `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
            
            // Check if slot overlaps with existing appointments
            const slotStartDateTime = new Date(baseDate)
            slotStartDateTime.setHours(hr, min, 0, 0)
            const slotEndDateTime = new Date(slotStartDateTime.getTime() + durationMinutes * 60000)

            const isBooked = appointments?.some(apt => {
                const aptStart = new Date(apt.startTime)
                const aptEnd = new Date(apt.startTime.getTime() + apt.service.durationMins * 60000)

                // Only check for the selected barber and selected date
                if (apt.barberId !== selectedBarber) return false
                
                // Ensure the appointment is on the selected date
                if (aptStart.getDate() !== slotStartDateTime.getDate() || 
                    aptStart.getMonth() !== slotStartDateTime.getMonth() || 
                    aptStart.getFullYear() !== slotStartDateTime.getFullYear()) {
                    return false
                }

                return (
                    (slotStartDateTime >= aptStart && slotStartDateTime < aptEnd) ||
                    (slotEndDateTime > aptStart && slotEndDateTime <= aptEnd) ||
                    (slotStartDateTime <= aptStart && slotEndDateTime >= aptEnd)
                )
            })

            if (!isBooked) {
                // If it's today, filter out past times
                const now = new Date()
                if (dateObj.toDateString() === now.toDateString()) {
                    const currentNowMins = now.getHours() * 60 + now.getMinutes()
                    if (currentMins > currentNowMins + 30) { // allow booking 30 mins in advance
                        slots.push(timeStr)
                    }
                } else {
                    slots.push(timeStr)
                }
            }

            currentMins += 30 // 30 min intervals
        }

        return slots
    }, [selectedBarber, selectedDate, selectedService, schedules, appointments, services])

    const isBarberAvailableOnDate = selectedDate && checkDateAvailability(selectedDate)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
            setError('Please complete all fields')
            return
        }

        if (!isBarberAvailableOnDate) {
            setError('The selected barber is not available on this date. Please choose another date or staff member.')
            return
        }

        if (!customerId) {
            setError('Please sign in to book an appointment.')
            return
        }

        setIsSubmitting(true)

        const formData = new FormData()
        formData.append('customerId', customerId)
        formData.append('barbershopId', shopId)
        formData.append('serviceId', selectedService)
        formData.append('barberId', selectedBarber)
        formData.append('date', selectedDate)
        formData.append('time', selectedTime)

        try {
            const res = await fetch('/book/submit', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const text = await res.text()
                throw new Error(text || 'Failed to book appointment')
            }

            // Redirect happens in the route itself
            window.location.href = res.url || `/book/success/temp`
        } catch (err: any) {
            setError(err.message)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950/50 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col gap-10">
            {error && <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl font-medium border border-red-200 dark:border-red-900/50">{error}</div>}
            
            <div className="space-y-10">
                {/* Step 1: Service */}
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">1. Select Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {services.map(service => (
                            <div 
                                key={service.id} 
                                onClick={() => {
                                    setSelectedService(service.id)
                                    setSelectedTime('') // Reset time when service changes
                                }}
                                className={`
                                    flex flex-col p-5 rounded-2xl border-2 transition-all cursor-pointer
                                    ${selectedService === service.id 
                                        ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 shadow-md scale-[1.02]' 
                                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-black/50 dark:hover:border-white/50 hover:shadow-sm'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold text-lg transition-colors ${selectedService === service.id ? 'text-black dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>{service.name}</h4>
                                    <span className="font-extrabold text-lg text-black dark:text-white">${(service.price).toString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-zinc-500 gap-1.5 mt-auto">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    {service.durationMins} min
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Only show next steps if a service is selected */}
                {selectedService && (
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        {/* Booking Steps container - Dimmed if not logged in */}
                        <div className={`space-y-6 ${!customerId ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            {/* Staff Grid */}
                            <div>
                                <label className="text-sm font-bold text-zinc-900 dark:text-white mb-3 block border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    Select Professional
                                </label>
                                {staff.length === 1 ? (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 transition-all">
                                        {staff[0].avatarUrl ? (
                                            <img src={staff[0].avatarUrl} alt={staff[0].name || ''} className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-lg border-2 border-white dark:border-zinc-950 shadow-sm">
                                                {(staff[0].name || 'Staff').charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-bold text-zinc-900 dark:text-white text-lg">{staff[0].name || 'Staff'}</p>
                                            <p className="text-zinc-500 text-sm font-medium">{staff[0].role}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {staff.map(member => (
                                            <div
                                                key={member.id}
                                                onClick={() => {
                                                    setSelectedBarber(member.id)
                                                    setSelectedDate('')
                                                    setSelectedTime('')
                                                }}
                                                className={`
                                                    flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer
                                                    ${selectedBarber === member.id ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
                                                `}
                                            >
                                                {member.avatarUrl ? (
                                                    <img src={member.avatarUrl} alt={member.name || ''} className={`w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 transition-transform ${selectedBarber === member.id ? 'scale-110 shadow-sm' : ''}`} />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-transform ${selectedBarber === member.id ? 'bg-black text-white dark:bg-white dark:text-black scale-110 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                        {(member.name || 'S').charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className={`font-bold transition-colors ${selectedBarber === member.id ? 'text-black dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>{member.name || 'Staff'}</p>
                                                    <p className="text-zinc-500 text-sm font-medium">{member.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Step 2: Date and Time Section */}
                            <div>
                                <h3 className="text-xl font-semibold">{staff.length > 1 ? '3.' : '2.'} Select Date & Time</h3>
                                {!selectedBarber ? (
                                    <div className="text-zinc-500 text-sm py-4">Please select a professional first.</div>
                                ) : (
                                    <div className="space-y-6 mt-4">
                                        {/* Horizontal Date Selector */}
                                        <div>
                                            <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide py-1">
                                                {next14Days.map(dateStr => {
                                                    const isAvailable = checkDateAvailability(dateStr)
                                                    const isSelected = selectedDate === dateStr
                                                    
                                                    const [y, m, d] = dateStr.split('-').map(Number)
                                                    const dateObj = new Date(y, m - 1, d)
                                                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                                                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' })

                                                    return (
                                                        <button
                                                            key={dateStr}
                                                            type="button"
                                                            disabled={!isAvailable}
                                                            onClick={() => {
                                                                setSelectedDate(dateStr)
                                                                setSelectedTime('') // reset time
                                                            }}
                                                            className={`
                                                                shrink-0 snap-start flex flex-col items-center justify-center w-[72px] h-[88px] rounded-2xl border transition-all cursor-pointer
                                                                ${isSelected ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}
                                                                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                                                            `}
                                                        >
                                                            <span className={`text-xs font-bold uppercase ${isSelected ? 'text-black dark:text-white' : 'text-zinc-500'}`}>{monthName}</span>
                                                            <span className="text-2xl font-extrabold leading-none my-1">{d}</span>
                                                            <span className={`text-xs font-medium ${isSelected ? 'text-black dark:text-white' : 'text-zinc-500'}`}>{dayName}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Time Grid */}
                                        <div>
                                            {selectedDate && (
                                                <>
                                                    {!isBarberAvailableOnDate ? (
                                                        <div className="text-amber-600 dark:text-amber-500 font-medium py-2 flex items-center gap-2">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                            Professional unavailable this day
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                                                                {availableTimeSlots.length > 0 ? availableTimeSlots.map(time => {
                                                                    const isSelected = selectedTime === time
                                                                    return (
                                                                        <button
                                                                            key={time}
                                                                            type="button"
                                                                            onClick={() => setSelectedTime(time)}
                                                                            className={`
                                                                                py-3 rounded-xl border font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-zinc-950
                                                                                ${isSelected ? 'border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white' : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'}
                                                                            `}
                                                                        >
                                                                            {/* Convert 24h to 12h */}
                                                                            {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                                        </button>
                                                                    )
                                                                }) : (
                                                                    <div className="col-span-full py-2 text-zinc-500">No time slots configured.</div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-4">
                {!customerId ? (
                    <button
                        type="button"
                        onClick={() => router.push(`/client/login?returnUrl=/book/${shopId}`)}
                        className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black py-4 rounded-xl font-semibold text-lg transition-colors cursor-pointer shadow-md"
                    >
                        Sign in to Book
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={isSubmitting || !isBarberAvailableOnDate}
                        className="w-full bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                )}
            </div>
        </form>
    )
}