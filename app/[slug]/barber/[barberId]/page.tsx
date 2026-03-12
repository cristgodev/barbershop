import { prisma } from "../../../lib/prisma"
import { notFound, redirect } from "next/navigation"
import BookingForm from "../../../book/[shopId]/BookingForm"

export default async function BarberMiniPage({ params }: { params: Promise<{ slug: string, barberId: string }> }) {
    const resolvedParams = await params
    const { slug, barberId } = resolvedParams

    const shop = await prisma.barbershop.findUnique({
        where: { slug: slug },
        include: {
            services: true,
            staff: {
                where: {
                    id: barberId,
                    role: {
                        in: ['OWNER', 'BARBER', 'MANAGER', 'ADMIN']
                    }
                }
            }
        }
    })

    if (!shop || shop.staff.length === 0) {
        return notFound()
    }

    const barber = shop.staff[0]

    const demoCustomer = await prisma.user.findFirst({
        where: { role: 'CUSTOMER' }
    })
    
    if (!demoCustomer) {
        redirect('/')
    }

    const schedules = await prisma.schedule.findMany({ where: { barberId: barber.id } })
    
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    
    const timeOffs = await prisma.timeOff.findMany({ 
        where: { 
            barberId: barber.id, 
            date: { gte: startOfToday } 
        } 
    })

    const appointments = await prisma.appointment.findMany({
        where: {
            barberId: barber.id,
            date: { gte: startOfToday },
            status: { in: ['CONFIRMED', 'PENDING'] }
        },
        include: {
            service: {
                select: { durationMins: true }
            }
        }
    })

    const shopTimeOffs = await prisma.shopTimeOff.findMany({
        where: {
            barbershopId: shop.id,
            date: { gte: startOfToday }
        }
    })

    return (
        <div className="flex flex-col gap-16 pb-12 w-full max-w-4xl mx-auto px-4 mt-8">
            
            <a href={`/${slug}`} className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white inline-block transition-colors -mb-10">&larr; Back to {shop.name}</a>

            {/* Barber Profile Header */}
            <section className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 z-0 opacity-50"></div>
                
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-5xl md:text-6xl overflow-hidden shrink-0 shadow-xl ring-4 ring-white dark:ring-zinc-950 z-10">
                    {barber.avatarUrl ? (
                        <img src={barber.avatarUrl} alt={barber.name || 'Barber'} className="w-full h-full object-cover" />
                    ) : (
                        barber.name?.charAt(0) || 'B'
                    )}
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        {barber.name}
                    </h1>
                    <p className="text-lg font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest z-10 relative">
                        {barber.role === 'OWNER' ? 'BARBER (OWNER)' : barber.role}
                    </p>
                    
                    {barber.bio ? (
                        <p className="text-zinc-700 dark:text-zinc-300 max-w-2xl mx-auto pt-4 text-lg leading-relaxed z-10 relative">
                            "{barber.bio}"
                        </p>
                    ) : (
                        <p className="text-zinc-500 dark:text-zinc-500 max-w-xl mx-auto pt-4 z-10 relative">
                            Book your premium grooming experience with {barber.name} at {shop.name}. Select a service and time below.
                        </p>
                    )}
                </div>
            </section>

            {/* Profile Gallery (if any) */}
            {barber.portfolioUrls && (
                <section className="space-y-6">
                    <h3 className="text-2xl font-bold tracking-tight px-2">Portfolio</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {barber.portfolioUrls.split(',').map((url, i) => {
                            const trimmedUrl = url.trim()
                            if (!trimmedUrl) return null
                            return (
                                <div key={trimmedUrl + i} className="aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                    <img src={trimmedUrl} alt="Portfolio Work" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Smart Booking Form Section */}
            <section className="space-y-8">
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 w-full">
                    <BookingForm 
                        shopId={shop.id}
                        services={shop.services}
                        staff={[barber]}  // Notice we only pass this specific barber to force auto-selection
                        schedules={schedules}
                        timeOffs={timeOffs}
                        shopTimeOffs={shopTimeOffs}
                        appointments={appointments}
                        customerId={demoCustomer.id}
                    />
                </div>
            </section>

        </div>
    )
}
