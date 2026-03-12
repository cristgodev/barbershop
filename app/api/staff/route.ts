import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    // Only logged in OWNERS can add staff
    if (!session || !session.user || session.user.role !== 'OWNER') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, email, password, barbershopId } = body

        if (!name || !email || !password || !barbershopId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate the shop belongs to the owner
        if (session.user.barbershopId !== barbershopId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        // Create the BARBER user
        const newStaff = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'BARBER',
                barbershopId
            }
        })

        // Also give them a default schedule
        const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]
        await prisma.schedule.createMany({
            data: DAYS_OF_WEEK.map(day => ({
                barberId: newStaff.id,
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '18:00',
                isWorkingDay: day >= 1 && day <= 5 // Mon-Fri
            }))
        })

        return NextResponse.json({ success: true, user: { id: newStaff.id, name: newStaff.name } })

    } catch (error: any) {
        console.error('Add Staff error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
