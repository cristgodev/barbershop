'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: string; name: string | null; role: string }
type Schedule = { id?: string; barberId: string; dayOfWeek: number; startTime: string; endTime: string; isWorkingDay: boolean }
type TimeOff = { id: string; barberId: string; date: Date; reason: string | null }
type ShopTimeOff = { id: string; barbershopId: string; date: Date; reason: string | null }

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ScheduleForm({
    staffMembers,
    initialSchedules,
    initialTimeOffs,
    initialShopTimeOffs,
    currentUserRole,
    barbershopId
}: {
    staffMembers: User[];
    initialSchedules: Schedule[];
    initialTimeOffs: TimeOff[];
    initialShopTimeOffs: ShopTimeOff[];
    currentUserRole: string;
    barbershopId: string;
}) {
    const router = useRouter()
    const [selectedBarber, setSelectedBarber] = useState(staffMembers[0]?.id || '')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Get schedules for selected barber, or initialize defaults
    const getBarberSchedules = (barberId: string) => {
        const existing = initialSchedules.filter(s => s.barberId === barberId)
        if (existing.length === 0) {
            // Default 9-5 Mon-Fri
            return DAYS_OF_WEEK.map((_, i) => ({
                barberId,
                dayOfWeek: i,
                startTime: '09:00',
                endTime: '18:00',
                isWorkingDay: i >= 1 && i <= 5
            }))
        }
        // Ensure all 7 days exist
        return DAYS_OF_WEEK.map((_, i) => {
            const found = existing.find(e => e.dayOfWeek === i)
            return found || {
                barberId,
                dayOfWeek: i,
                startTime: '09:00',
                endTime: '18:00',
                isWorkingDay: false
            }
        })
    }

    const [schedules, setSchedules] = useState<Schedule[]>(getBarberSchedules(selectedBarber))

    // Switch barber handler
    const handleBarberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value
        setSelectedBarber(newId)
        setSchedules(getBarberSchedules(newId))
    }

    const handleScheduleChange = (dayOfWeek: number, field: keyof Schedule, value: any) => {
        setSchedules(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    }

    const saveSchedules = async () => {
        setIsLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedules })
            })

            if (!res.ok) throw new Error('Failed to save schedules')

            setMessage('Schedules saved successfully!')
            router.refresh()
        } catch (error: any) {
            setMessage(error.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    // Time-off State
    const [timeOffDate, setTimeOffDate] = useState('')
    const [timeOffReason, setTimeOffReason] = useState('')

    const addTimeOff = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!timeOffDate) return

        setIsLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/schedule/timeoff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barberId: selectedBarber, date: timeOffDate, reason: timeOffReason })
            })

            if (!res.ok) throw new Error('Failed to add time off')

            setMessage('Time off added successfully!')
            setTimeOffDate('')
            setTimeOffReason('')
            router.refresh()
        } catch (error: any) {
            setMessage(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const barberTimeOffs = initialTimeOffs.filter(t => t.barberId === selectedBarber)

    // Shop Time-Off State (Global Closures)
    const [shopTimeOffDate, setShopTimeOffDate] = useState('')
    const [shopTimeOffReason, setShopTimeOffReason] = useState('')

    const addShopTimeOff = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shopTimeOffDate) return

        setIsLoading(true)
        setMessage('')
        try {
            const res = await fetch('/api/schedule/shop-timeoff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barbershopId, date: shopTimeOffDate, reason: shopTimeOffReason })
            })

            if (!res.ok) throw new Error('Failed to add global shop closure')

            setMessage('Shop closure added successfully! It will reflect in all bookings immediately.')
            setShopTimeOffDate('')
            setShopTimeOffReason('')
            router.refresh()
        } catch (error: any) {
            setMessage(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 md:space-y-12">

            {/* Barber Selector */}
            {staffMembers.length > 1 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                    <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Select Staff Member to Manage</label>
                    <select
                        value={selectedBarber}
                        onChange={handleBarberChange}
                        className="w-full sm:w-1/2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-all cursor-pointer font-medium"
                    >
                        {staffMembers.map(staff => (
                            <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
                        ))}
                    </select>
                </div>
            )}

            {message && (
                <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 p-4 rounded-xl text-sm border border-emerald-200 dark:border-emerald-800/50 font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {message}
                </div>
            )}

            {/* Weekly Schedule */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-1">Weekly Schedule</h2>
                <p className="text-sm text-zinc-500 mb-6">Set regular working hours for each day of the week.</p>
                <div className="space-y-3">
                    {schedules.map((schedule) => (
                        <div key={schedule.dayOfWeek} className="group flex flex-col sm:flex-row items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 transition-colors">
                            <div className="w-full sm:w-36 flex items-center gap-3">
                                <label className="relative flex items-center justify-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={schedule.isWorkingDay}
                                        onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'isWorkingDay', e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-600 rounded peer-checked:bg-black peer-checked:border-black dark:peer-checked:bg-white dark:peer-checked:border-white transition-all flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white dark:text-black opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                </label>
                                <span className={`font-semibold ${schedule.isWorkingDay ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}>
                                    {DAYS_OF_WEEK[schedule.dayOfWeek]}
                                </span>
                            </div>

                            <div className={`flex flex-1 items-center gap-3 ${schedule.isWorkingDay ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                                <input
                                    type="time"
                                    value={schedule.startTime}
                                    onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'startTime', e.target.value)}
                                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm w-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-all font-medium"
                                />
                                <span className="text-zinc-400 text-sm font-medium">to</span>
                                <input
                                    type="time"
                                    value={schedule.endTime}
                                    onChange={(e) => handleScheduleChange(schedule.dayOfWeek, 'endTime', e.target.value)}
                                    className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm w-full focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={saveSchedules}
                    disabled={isLoading}
                    className="mt-8 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
                >
                    {isLoading ? 'Saving...' : 'Save Weekly Schedule'}
                </button>
            </div>

            {/* Shop-Wide Closures (OWNER ONLY) */}
            {currentUserRole === 'OWNER' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-1 text-white">Full Shop Closures <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded ml-2 border border-blue-500/20">Shop-Wide</span></h2>
                    <p className="text-sm text-zinc-400 mb-6">Schedule days when the entire barbershop will be closed (e.g., National Holidays). <strong className="text-zinc-300">All bookings</strong> will be disabled for these dates.</p>

                    <form onSubmit={addShopTimeOff} className="flex flex-col sm:flex-row gap-4 items-end mb-8 p-5 border border-zinc-800 bg-black/30 rounded-xl">
                        <div className="w-full sm:flex-1 space-y-1.5">
                            <label className="block text-xs font-semibold text-zinc-300">Date to Close Shop</label>
                            <input
                                type="date"
                                required
                                value={shopTimeOffDate}
                                onChange={(e) => setShopTimeOffDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-white"
                            />
                        </div>
                        <div className="w-full sm:flex-1 space-y-1.5">
                            <label className="block text-xs font-semibold text-zinc-300">Reason (e.g., National Holiday)</label>
                            <input
                                type="text"
                                placeholder="Public Reason"
                                value={shopTimeOffReason}
                                onChange={(e) => setShopTimeOffReason(e.target.value)}
                                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !shopTimeOffDate}
                            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            Schedule Closure
                        </button>
                    </form>

                    {initialShopTimeOffs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {initialShopTimeOffs.map(timeOff => {
                                const dateObj = new Date(timeOff.date)
                                return (
                                    <div key={timeOff.id} className="group flex flex-col justify-between p-5 border border-zinc-800 rounded-2xl bg-zinc-950/50 hover:border-red-900/50 transition-colors">
                                        <div className="mb-4">
                                            <div className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">Shop Closed</div>
                                            <div className="font-bold text-lg text-white">
                                                {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            {timeOff.reason && <div className="text-sm text-zinc-400 font-medium mt-1">{timeOff.reason}</div>}
                                        </div>
                                        <button
                                            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm font-semibold transition-colors mt-auto w-fit"
                                            onClick={async () => {
                                                if (!confirm("Are you sure you want to re-open the shop for this date?")) return;
                                                await fetch('/api/schedule/shop-timeoff?id=' + timeOff.id, { method: 'DELETE' });
                                                router.refresh()
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                            Re-Open Date
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm">No global shop closures scheduled.</p>
                    )}
                </div>
            )}

            {/* Exceptions / Time Off (Barber Level) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-1">Time Off (Individual Barber)</h2>
                <p className="text-sm text-zinc-500 mb-6">Block off specific dates for vacations, sick days, or personal days for <strong>{staffMembers.find(s => s.id === selectedBarber)?.name || 'this barber'}</strong>.</p>

                <form onSubmit={addTimeOff} className="flex flex-col sm:flex-row gap-4 items-end mb-8 p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                    <div className="w-full sm:flex-1 space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Date</label>
                        <input
                            type="date"
                            required
                            value={timeOffDate}
                            onChange={(e) => setTimeOffDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-all"
                        />
                    </div>
                    <div className="w-full sm:flex-1 space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Reason (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Summer Vacation"
                            value={timeOffReason}
                            onChange={(e) => setTimeOffReason(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !timeOffDate}
                        className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        Block Date
                    </button>
                </form>

                {barberTimeOffs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {barberTimeOffs.map(timeOff => {
                            const dateObj = new Date(timeOff.date)
                            return (
                                <div key={timeOff.id} className="group flex flex-col justify-between p-5 border border-red-100 dark:border-red-900/30 rounded-2xl bg-red-50/50 dark:bg-red-900/10 hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                                    <div className="mb-4">
                                        <div className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Time Off</div>
                                        <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                                            {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        {timeOff.reason && <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mt-1">{timeOff.reason}</div>}
                                    </div>
                                    <button
                                        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-semibold transition-colors mt-auto w-fit"
                                        onClick={async () => {
                                            if (!confirm("Are you sure you want to cancel this time off?")) return;
                                            await fetch('/api/schedule/timeoff?id=' + timeOff.id, { method: 'DELETE' });
                                            router.refresh()
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                        Remove
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                        <svg className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium">No upcoming time off scheduled.</p>
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Use the form above to add one.</p>
                    </div>
                )}
            </div>

        </div>
    )
}
