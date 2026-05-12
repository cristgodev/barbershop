import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { appointmentId, startTime, endTime } = data

        if (!appointmentId || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const apt = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { barbershop: true }
        })

        if (!apt) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
        }

        // Check permissions: Must be OWNER or the assigned barber
        if (session.user.role !== 'OWNER' && session.user.id !== apt.barberId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const startDate = new Date(startTime)
        const endDate = new Date(endTime)
        
        // Use the start date for the base 'date' field
        const dateOnly = new Date(startDate)
        dateOnly.setUTCHours(0,0,0,0)

        // Ensure new time doesn't overlap (Basic check, real system might need more robust checks)
        const conflictingApt = await prisma.appointment.findFirst({
            where: {
                barberId: apt.barberId,
                id: { not: apt.id },
                status: { in: ['PENDING', 'CONFIRMED'] },
                OR: [
                    {
                        startTime: { lt: endDate },
                        endTime: { gt: startDate }
                    }
                ]
            }
        })

        if (conflictingApt) {
            return NextResponse.json({ error: 'El barbero ya tiene una cita en ese horario.' }, { status: 400 })
        }

        const updatedApt = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                startTime: startDate,
                endTime: endDate,
                date: dateOnly
            }
        })

        return NextResponse.json(updatedApt)

    } catch (error: any) {
        console.error('Reschedule error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
