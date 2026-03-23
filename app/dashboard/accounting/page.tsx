import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'
import { redirect } from 'next/navigation'
import AccountingClient from './AccountingClient'

export default async function AccountingPage() {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'OWNER' || !session.user.barbershopId) {
        redirect('/login')
    }

    const barbershop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId },
        include: {
            appointments: {
                where: { status: 'COMPLETED' },
                include: {
                    service: true,
                    barber: true
                }
            },
            sales: true,
            staff: true
        }
    })

    if (!barbershop) {
        return <div>Barbershop not found</div>
    }

    // Time boundaries
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(todayStart.getDate() - todayStart.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Helper to initialize a PeriodStats object
    const initPeriod = () => {
        const stats = { totalRevenue: 0, totalCuts: 0, barbers: {} as Record<string, { id: string, name: string, revenue: number, cuts: number }> }
        barbershop.staff.forEach(staff => {
            stats.barbers[staff.id] = { id: staff.id, name: staff.name || 'Unknown', revenue: 0, cuts: 0 }
        })
        return stats
    }

    const rawStats = {
        today: initPeriod(),
        week: initPeriod(),
        month: initPeriod(),
        all: initPeriod()
    }

    // Aggregate data
    barbershop.appointments.forEach(app => {
        const appDate = new Date(app.date)
        const appTime = appDate.getTime()
        const price = Number(app.service.price) || 0
        const barberId = app.barber.id

        // All Time
        rawStats.all.totalRevenue += price
        rawStats.all.totalCuts += 1
        if (rawStats.all.barbers[barberId]) {
            rawStats.all.barbers[barberId].revenue += price
            rawStats.all.barbers[barberId].cuts += 1
        }

        // Today
        if (appTime >= todayStart.getTime() && appTime < todayStart.getTime() + 86400000) {
            rawStats.today.totalRevenue += price
            rawStats.today.totalCuts += 1
            if (rawStats.today.barbers[barberId]) {
                rawStats.today.barbers[barberId].revenue += price
                rawStats.today.barbers[barberId].cuts += 1
            }
        }

        // This Week
        if (appTime >= weekStart.getTime()) {
            rawStats.week.totalRevenue += price
            rawStats.week.totalCuts += 1
            if (rawStats.week.barbers[barberId]) {
                rawStats.week.barbers[barberId].revenue += price
                rawStats.week.barbers[barberId].cuts += 1
            }
        }

        // This Month
        if (appTime >= monthStart.getTime()) {
            rawStats.month.totalRevenue += price
            rawStats.month.totalCuts += 1
            if (rawStats.month.barbers[barberId]) {
                rawStats.month.barbers[barberId].revenue += price
                rawStats.month.barbers[barberId].cuts += 1
            }
        }
    })

    // Aggregate Product Sales
    barbershop.sales.forEach(sale => {
        const saleDate = new Date(sale.createdAt)
        const saleTime = saleDate.getTime()
        const price = sale.totalAmount || 0
        const barberId = sale.barberId

        // All Time
        rawStats.all.totalRevenue += price
        if (rawStats.all.barbers[barberId]) {
            rawStats.all.barbers[barberId].revenue += price
        }

        // Today
        if (saleTime >= todayStart.getTime() && saleTime < todayStart.getTime() + 86400000) {
            rawStats.today.totalRevenue += price
            if (rawStats.today.barbers[barberId]) {
                rawStats.today.barbers[barberId].revenue += price
            }
        }

        // This Week
        if (saleTime >= weekStart.getTime()) {
            rawStats.week.totalRevenue += price
            if (rawStats.week.barbers[barberId]) {
                rawStats.week.barbers[barberId].revenue += price
            }
        }

        // This Month
        if (saleTime >= monthStart.getTime()) {
            rawStats.month.totalRevenue += price
            if (rawStats.month.barbers[barberId]) {
                rawStats.month.barbers[barberId].revenue += price
            }
        }
    })

    // Sort barbers by revenue for each period
    const sortBarbers = (periodObj: any) => {
        return Object.values(periodObj).sort((a: any, b: any) => b.revenue - a.revenue)
    }

    const finalStats = {
        currency: barbershop.currency,
        today: { ...rawStats.today, barbers: sortBarbers(rawStats.today.barbers) },
        week: { ...rawStats.week, barbers: sortBarbers(rawStats.week.barbers) },
        month: { ...rawStats.month, barbers: sortBarbers(rawStats.month.barbers) },
        all: { ...rawStats.all, barbers: sortBarbers(rawStats.all.barbers) }
    }

    return <AccountingClient stats={finalStats as any} />
}
