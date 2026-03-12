import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const body = await req.json()
        const { schedules } = body

        if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
            return new NextResponse('Invalid mapping', { status: 400 })
        }

        const barberId = schedules[0].barberId

        // Verify permissions
        if (session.user.role === 'BARBER' && session.user.id !== barberId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        // Use a transaction since we delete the old ones and create new ones
        await prisma.$transaction(async (tx) => {
            await tx.schedule.deleteMany({
                where: { barberId }
            })

            await tx.schedule.createMany({
                data: schedules.map(s => ({
                    barberId: s.barberId,
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    isWorkingDay: s.isWorkingDay
                }))
            })
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Save schedule error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}
