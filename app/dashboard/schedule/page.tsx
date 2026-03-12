import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { prisma } from "../../lib/prisma"
import { redirect } from "next/navigation"
import ScheduleForm from "./ScheduleForm"

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        redirect("/login")
    }

    const userId = session.user.id
    const barbershopId = session.user.barbershopId

    // Solo permitimos OWNER o BARBER gestionar horarios
    if (session.user.role === 'CUSTOMER') {
        redirect("/")
    }

    // Get staff members for this shop if OWNER, otherwise just the logged-in barber
    let staffMembers = []

    if (session.user.role === 'OWNER' && barbershopId) {
        staffMembers = await prisma.user.findMany({
            where: { barbershopId },
            select: { id: true, name: true, role: true }
        })
    } else {
        staffMembers = await prisma.user.findMany({
            where: { id: userId },
            select: { id: true, name: true, role: true }
        })
    }

    // Get existing schedules and time-offs for the staff
    const staffIds = staffMembers.map(s => s.id)

    const schedules = await prisma.schedule.findMany({
        where: { barberId: { in: staffIds } }
    })

    const timeOffs = await prisma.timeOff.findMany({
        where: {
            barberId: { in: staffIds },
            date: { gte: new Date() } // Sólo futuros
        },
        orderBy: { date: 'asc' }
    })

    const shopTimeOffs = await prisma.shopTimeOff.findMany({
        where: {
            barbershopId: barbershopId || '',
            date: { gte: new Date() }
        },
        orderBy: { date: 'asc' }
    })

    return (
        <div className="max-w-6xl w-full mx-auto pb-12">
            <div className="flex items-center justify-between pb-6 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Schedule & Time Off</h2>
                    <p className="text-zinc-500 mt-2">Manage your working hours and upcoming vacations.</p>
                </div>
            </div>

            <ScheduleForm
                staffMembers={staffMembers}
                initialSchedules={schedules}
                initialTimeOffs={timeOffs}
                initialShopTimeOffs={shopTimeOffs}
                currentUserRole={session.user.role}
                barbershopId={barbershopId || ''}
            />
        </div>
    )
}
