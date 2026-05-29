import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { sendAppointmentWebhook } from '../../../lib/webhook'
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
            include: { 
                barbershop: true,
                service: true
            }
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
            data: { status: 'COMPLETED' },
            include: { customer: true }
        })

        // Give dynamic loyalty points based on service price and shop ratio if the appointment has a registered customer
        if (updated.customerId && appointment.service) {
            const price = Number(appointment.service.price) || 0
            const ratio = appointment.barbershop.loyaltyRatio || 5
            const pointsToAward = price > 0 ? Math.max(1, Math.round(price / ratio)) : 0

            await prisma.customerLoyalty.upsert({
                where: {
                    userId_barbershopId: {
                        userId: updated.customerId,
                        barbershopId: appointment.barbershopId
                    }
                },
                update: {
                    points: { increment: pointsToAward }
                },
                create: {
                    userId: updated.customerId,
                    barbershopId: appointment.barbershopId,
                    points: pointsToAward
                }
            })
        }

        // Trigger WhatsApp Webhook for completion
        sendAppointmentWebhook(updated.id, 'APPOINTMENT_COMPLETED')

        return NextResponse.json(updated)

    } catch (error: any) {
        console.error('Complete appointment error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}
