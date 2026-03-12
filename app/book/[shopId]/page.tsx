import { prisma } from "../../lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import BookingForm from "./BookingForm"

export default async function BookAppointmentPage({ params }: { params: Promise<{ shopId: string }> }) {
    const resolvedParams = await params;
    const shopId = resolvedParams.shopId;

    const shop = await prisma.barbershop.findUnique({
        where: { id: shopId },
        include: {
            services: true,
            staff: {
                where: {
                    role: {
                        in: ['OWNER', 'BARBER', 'MANAGER', 'ADMIN']
                    }
                }
            }
        }
    })

    const session = await getServerSession(authOptions)
    const customerId = session?.user?.id || null

    if (!shop) {
        redirect('/book') // redirect back to directory if not found
    }

    const staffIds = shop.staff.map(s => s.id)
    const schedules = await prisma.schedule.findMany({ where: { barberId: { in: staffIds } } })

    // We get today without hours to ensure we don't skip today's day off if it's already mid-day
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const timeOffs = await prisma.timeOff.findMany({
        where: {
            barberId: { in: staffIds },
            date: { gte: startOfToday }
        }
    })

    const appointments = await prisma.appointment.findMany({
        where: {
            barberId: { in: staffIds },
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

    // Create a simple UI to handle booking selection
    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-4xl mx-auto">
            <div>
                <a href="/book" className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white mb-4 inline-block transition-colors">&larr; Back to Shops</a>
                <h2 className="text-3xl font-bold tracking-tight">Book at {shop.name}</h2>
                <p className="text-zinc-500 mt-2">Select a service and a barber to schedule your visit.</p>
            </div>

            <BookingForm
                shopId={shop.id}
                services={shop.services}
                staff={shop.staff}
                schedules={schedules}
                timeOffs={timeOffs}
                shopTimeOffs={shopTimeOffs}
                appointments={appointments}
                customerId={customerId}
            />
        </div>
    )
}

