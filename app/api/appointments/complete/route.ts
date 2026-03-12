import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const body = await req.json()
        const { appointmentId } = body

        if (!appointmentId) {
            return new NextResponse('Missing appointment ID', { status: 400 })
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { barbershop: { select: { staff: { select: { id: true } } } } }
        })

        if (!appointment) {
            return new NextResponse('Appointment not found', { status: 404 })
        }

        // Verify permissions - only the barber assigned or the owner can complete
        const isAssignedBarber = session.user.id === appointment.barberId
        const isShopOwner = session.user.role === 'OWNER' && session.user.barbershopId === appointment.barbershopId

        if (!isAssignedBarber && !isShopOwner) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const updated = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' }
        })

        return NextResponse.json(updated)

    } catch (error: any) {
        console.error('Complete appointment error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}
