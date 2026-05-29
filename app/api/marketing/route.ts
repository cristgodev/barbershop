import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) return NextResponse.json({ error: 'No shop associated' }, { status: 400 })

        const campaigns = await prisma.campaign.findMany({
            where: { barbershopId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, campaigns })

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) return NextResponse.json({ error: 'No shop associated' }, { status: 400 })

        const body = await req.json()
        const { message, imageUrl } = body

        if (!message || !message.trim()) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
        }

        // Count active customers in this barbershop who will receive the campaign
        const clientCount = await prisma.user.count({
            where: { role: 'CUSTOMER' } // Direct customers in the DB
        })

        // Create campaign log in the database
        const campaign = await prisma.campaign.create({
            data: {
                barbershopId,
                message: message.trim(),
                imageUrl: imageUrl || null,
                sentToCount: clientCount || 1 // Fallback to 1 if no clients registered yet
            }
        })

        return NextResponse.json({ success: true, campaign })

    } catch (error: any) {
        console.error('Error creating marketing campaign:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
