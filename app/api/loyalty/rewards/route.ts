import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) return NextResponse.json({ error: 'No shop associated' }, { status: 400 })

        const rewards = await prisma.loyaltyReward.findMany({
            where: { barbershopId },
            orderBy: { pointsCost: 'asc' }
        })

        return NextResponse.json({ success: true, rewards })

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
        const { name, pointsCost, description } = body

        if (!name || !name.trim()) {
            return NextResponse.json({ error: 'Reward name is required' }, { status: 400 })
        }
        if (!pointsCost || isNaN(Number(pointsCost)) || Number(pointsCost) < 1) {
            return NextResponse.json({ error: 'Points cost must be a positive number' }, { status: 400 })
        }

        const reward = await prisma.loyaltyReward.create({
            data: {
                barbershopId,
                name: name.trim(),
                pointsCost: Number(pointsCost),
                description: description || null
            }
        })

        return NextResponse.json({ success: true, reward })

    } catch (error: any) {
        console.error('Error creating loyalty reward:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Reward ID is required' }, { status: 400 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) return NextResponse.json({ error: 'No shop associated' }, { status: 400 })

        // Retrieve and authorize the reward before deletion (BOLA/IDOR protection)
        const reward = await prisma.loyaltyReward.findUnique({
            where: { id }
        })

        if (!reward || reward.barbershopId !== barbershopId) {
            return NextResponse.json({ error: 'Reward not found or access denied' }, { status: 404 })
        }

        await prisma.loyaltyReward.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error deleting loyalty reward:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
