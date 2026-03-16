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
            
            <a href={`/${slug}`} className="text-sm font-bold text-yellow-600 hover:text-yellow-500 inline-block transition-colors -mb-10">&larr; Volver a {shop.name}</a>

            {/* Barber Profile Header */}
            <section className="rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center text-center gap-6 relative">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-serif text-5xl md:text-6xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 relative z-10">
                    {barber.avatarUrl ? (
                        <img src={barber.avatarUrl} alt={barber.name || 'Barber'} className="w-full h-full object-cover filter grayscale-[10%]" />
                    ) : (
                        <span className="text-zinc-400 dark:text-zinc-600" style={{ fontFamily: 'var(--font-cormorant), serif' }}>{barber.name?.charAt(0) || 'B'}</span>
                    )}
                </div>
                <div className="space-y-3 z-10 text-zinc-900 dark:text-white">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-serif" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                        {barber.name}
                    </h1>
                    <p className="text-sm font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-[0.2em] relative">
                        {barber.role === 'OWNER' ? 'BARBER (OWNER)' : barber.role}
                    </p>
                    
                    {barber.bio ? (
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto pt-6 text-lg leading-relaxed font-medium relative">
                            "{barber.bio}"
                        </p>
                    ) : (
                        <p className="text-zinc-500 max-w-xl mx-auto pt-6 font-medium relative italic font-serif text-lg">
                            Reserva tu experiencia de grooming premium con {barber.name} en {shop.name}. Selecciona un servicio y fecha a continuación.
                        </p>
                    )}
                </div>
            </section>

            {/* Profile Gallery (if any) */}
            {barber.portfolioUrls && (
                <section className="space-y-8">
                    <h3 className="text-4xl font-bold tracking-tight px-2 font-serif text-zinc-900 dark:text-white text-center" style={{ fontFamily: 'var(--font-cormorant), serif' }}>Portafolio</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                        {barber.portfolioUrls.split(',').map((url, i) => {
                            const trimmedUrl = url.trim()
                            if (!trimmedUrl) return null
                            return (
                                <div key={trimmedUrl + i} className="aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group">
                                     <div className="absolute inset-0 bg-black/10 dark:bg-black/40 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img src={trimmedUrl} alt="Portfolio Work" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Smart Booking Form Section */}
            <section className="space-y-8">
                <div className="bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 sm:p-10 w-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent"></div>
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
