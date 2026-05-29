import { prisma } from "../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../lib/auth"
import DashboardClient from "./DashboardClient"
import DashboardAnalytics from "./DashboardAnalytics"
import OverviewHeaderClient from "./OverviewHeaderClient"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
        redirect('/login')
    }

    if (session.user.role === 'SUPERADMIN') {
        redirect('/superadmin')
    }

    if (!session.user.barbershopId) {
        redirect('/onboarding')
    }

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId },
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
            },
            sales: {
                include: {
                    customer: { select: { name: true } },
                    items: {
                        include: {
                            product: { select: { name: true } }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    if (!shop) {
        redirect('/onboarding')
    }

    const currentUser = session.user
    const isBarber = currentUser.role === 'BARBER'

    const staffMembers = await prisma.user.findMany({
        where: { barbershopId: session!.user.barbershopId, role: { in: ['OWNER', 'MANAGER', 'BARBER'] } },
        select: { id: true, name: true, avatarUrl: true }
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
        currency: shop!.currency,
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

    // Filter appointments and sales if the logged-in user is a BARBER
    const appointmentsToProcess = isBarber 
        ? shop!.appointments.filter(app => app.barberId === currentUser.id)
        : shop!.appointments

    const salesToProcess = isBarber
        ? shop!.sales.filter(sale => sale.barberId === currentUser.id)
        : shop!.sales

    appointmentsToProcess.forEach(app => {
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

    // Process retail product sales into the stats and charts
    salesToProcess.forEach(sale => {
        const saleDate = new Date(sale.createdAt)
        const saleTime = saleDate.getTime()
        const price = Number(sale.totalAmount) || 0
        
        // Boundaries
        if (saleTime >= todayStart.getTime() && saleTime < todayStart.getTime() + 86400000) {
            stats.today.revenue += price
        }
        if (saleTime >= weekStart.getTime()) {
            stats.week.revenue += price
        }
        if (saleTime >= monthStart.getTime()) {
            stats.month.revenue += price
        }

        // Add to charts
        if (saleTime >= todayStart.getTime() && saleTime < todayStart.getTime() + 86400000) {
            const hourIdx = saleDate.getHours() - 7
            if (hourIdx >= 0 && hourIdx < 16) {
                todayChart[hourIdx].revenue += price
            }
        }

        const weekDay = weekChart.find(d => 
            saleDate.getFullYear() === d.date.getFullYear() && 
            saleDate.getMonth() === d.date.getMonth() && 
            saleDate.getDate() === d.date.getDate()
        )
        if (weekDay) {
            weekDay.revenue += price
        }

        if (saleTime >= monthStart.getTime()) {
            const dayIdx = saleDate.getDate() - 1 // 1st is index 0
            if (monthChart[dayIdx]) {
                monthChart[dayIdx].revenue += price
            }
        }
    })

    const recentSales = salesToProcess.slice(0, 5)

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[1600px] px-2 sm:px-4 mx-auto">
            
            <OverviewHeaderClient />

            {/* Dynamic Interactive KPI Cards & Chart */}
            <DashboardAnalytics stats={stats} charts={{ today: todayChart, week: weekChart, month: monthChart }} userRole={currentUser.role} />

            {/* If logged-in user is a BARBER, show a beautiful recent product sales list */}
            {isBarber && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none"></div>
                    
                    <h3 className="text-xl font-bold font-serif mb-2 text-zinc-900 dark:text-white" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        Mis Ventas de Productos Recientes (POS)
                    </h3>
                    <p className="text-sm text-zinc-500 mb-6">Estas son las ventas de productos físicos (ceras, bebidas, etc.) que has registrado a través del Punto de Venta.</p>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Método de Pago</th>
                                    <th className="px-6 py-4">Productos</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-zinc-900 dark:text-zinc-100 divide-zinc-200 dark:divide-zinc-800">
                                {recentSales.length > 0 ? (
                                    recentSales.map((sale: any) => (
                                        <tr key={sale.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 text-zinc-500">
                                                {new Date(sale.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                {sale.customer?.name || 'Cliente de Paso'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sale.paymentMethod === 'CASH' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium max-w-[200px] truncate">
                                                {sale.items.map((item: any) => `${item.product.name} (x${item.quantity})`).join(', ')}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-yellow-600 font-serif">
                                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: shop!.currency, minimumFractionDigits: 0 }).format(sale.totalAmount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 font-medium">
                                            Aún no has registrado ninguna venta de productos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Main Content: Full Calendar */}
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
    )
}
