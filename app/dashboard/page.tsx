import { prisma } from "../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import DashboardClient from "./DashboardClient"
import DashboardAnalytics from "./DashboardAnalytics"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    // We can assume session exists because layout.tsx verified it

    const shop = await prisma.barbershop.findUnique({
        where: { id: session!.user.barbershopId },
        include: {
            appointments: {
                include: {
                    customer: true,
                    barber: true,
                    service: true,
                },
                orderBy: {
                    date: 'asc'
                }
            }
        }
    })

    const currentUser = session!.user

    const staffMembers = await prisma.user.findMany({
        where: { barbershopId: session!.user.barbershopId, role: { in: ['OWNER', 'MANAGER', 'BARBER'] } },
        select: { id: true, name: true }
    })

    const staffIds = staffMembers.map(s => s.id)
    
    const schedules = await prisma.schedule.findMany({
        where: { barberId: { in: staffIds } }
    })

    const timeOffs = await prisma.timeOff.findMany({
        where: { barberId: { in: staffIds } }
    })

    const shopTimeOffs = await prisma.shopTimeOff.findMany({
        where: { barbershopId: session!.user.barbershopId }
    })

    // Calculate real metrics for Today, Week, Month
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(todayStart.getDate() - todayStart.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = {
        today: { count: 0, revenue: 0, pending: 0 },
        week: { count: 0, revenue: 0, pending: 0 },
        month: { count: 0, revenue: 0, pending: 0 },
    }

    // Chart data for today (hourly: 7am to 10pm)
    const todayChart = Array.from({length: 16}).map((_, i) => ({
        name: `${i + 7}h`,
        revenue: 0,
        appointments: 0
    }))

    // Chart data for the last 7 days (oldest to newest)
    const weekChart = Array.from({length: 7}).map((_, i) => {
        const d = new Date(todayStart)
        d.setDate(d.getDate() - (6 - i))
        return {
            date: d,
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: 0,
            appointments: 0
        }
    })

    // Chart data for this month (daily)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const monthChart = Array.from({length: daysInMonth}).map((_, i) => ({
        name: String(i + 1),
        revenue: 0,
        appointments: 0
    }))

    shop!.appointments.forEach(app => {
        const appDate = new Date(app.date)
        const appTime = appDate.getTime()
        const price = Number(app.service.price) || 0
        
        // Boundaries
        if (appTime >= todayStart.getTime() && appTime < todayStart.getTime() + 86400000) {
            stats.today.count++
            stats.today.revenue += price
            if (app.status === 'PENDING') stats.today.pending++
        }
        if (appTime >= weekStart.getTime()) {
            stats.week.count++
            stats.week.revenue += price
            if (app.status === 'PENDING') stats.week.pending++
        }
        if (appTime >= monthStart.getTime()) {
            stats.month.count++
            stats.month.revenue += price
            if (app.status === 'PENDING') stats.month.pending++
        }

        // Add to charts
        if (app.status === 'COMPLETED' || app.status === 'CONFIRMED' || app.status === 'PENDING') {
            // Today chart
            if (appTime >= todayStart.getTime() && appTime < todayStart.getTime() + 86400000) {
                const hourIdx = appDate.getHours() - 7
                if (hourIdx >= 0 && hourIdx < 16) {
                    todayChart[hourIdx].revenue += price
                    todayChart[hourIdx].appointments++
                }
            }

            // Week chart
            const weekDay = weekChart.find(d => 
                appDate.getFullYear() === d.date.getFullYear() && 
                appDate.getMonth() === d.date.getMonth() && 
                appDate.getDate() === d.date.getDate()
            )
            if (weekDay) {
                weekDay.revenue += price
                weekDay.appointments++
            }

            // Month chart
            if (appTime >= monthStart.getTime()) {
                const dayIdx = appDate.getDate() - 1 // 1st is index 0
                if (monthChart[dayIdx]) {
                    monthChart[dayIdx].revenue += price
                    monthChart[dayIdx].appointments++
                }
            }
        }
    })

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-7xl mx-auto">
            
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
                <a href="/book" className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    New Booking
                </a>
            </div>

            {/* Dynamic Interactive KPI Cards & Chart */}
            <DashboardAnalytics stats={stats} charts={{ today: todayChart, week: weekChart, month: monthChart }} />

            {/* Main Content: Full Calendar */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
                <DashboardClient
                    appointments={shop!.appointments}
                    staffMembers={staffMembers}
                    currentUserRole={currentUser.role}
                    currentUserId={currentUser.id}
                    schedules={schedules}
                    timeOffs={timeOffs}
                    shopTimeOffs={shopTimeOffs}
                />
            </div>
        </div>
    )
}
