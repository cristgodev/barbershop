import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, price, durationMins, description } = body

        if (!name || !price || !durationMins) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const service = await prisma.service.create({
            data: {
                name,
                price: parseFloat(price),
                durationMins: parseInt(durationMins, 10),
                description,
                barbershopId: session.user.barbershopId
            }
        })

        return NextResponse.json({ success: true, service })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

        // Verify ownership
        const service = await prisma.service.findUnique({ where: { id } })
        if (!service || service.barbershopId !== session.user.barbershopId) {
            return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
        }

        await prisma.service.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
