import { prisma } from "../../../lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import BarberClient from "./BarberClient"

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

    const session = await getServerSession(authOptions)
    let customerId = null

    // Ensure the ID is only grabbed if it is a CUSTOMER role (or OWNER/ADMIN if they want to book themselves, but normally just user id).
    // The B2C Booking page allows booking for anyone who is logged in.
    if (session?.user?.id) {
        customerId = session.user.id
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
        <BarberClient 
            shop={shop}
            barber={barber}
            slug={slug}
            schedules={schedules}
            timeOffs={timeOffs}
            shopTimeOffs={shopTimeOffs}
            appointments={appointments}
            customerId={customerId}
        />
    )
}
