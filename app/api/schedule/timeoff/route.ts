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
        const { barberId, date, reason } = body

        if (!barberId || !date) {
            return new NextResponse('Missing fields', { status: 400 })
        }

        // Verify permissions
        if (session.user.role === 'BARBER' && session.user.id !== barberId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const parsedDate = new Date(date)

        const timeOff = await prisma.timeOff.create({
            data: {
                barberId,
                date: parsedDate,
                reason: reason || null
            }
        })

        return NextResponse.json(timeOff)

    } catch (error: any) {
        console.error('TimeOff error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        if (!id) return new NextResponse('Missing ID', { status: 400 })

        const timeOff = await prisma.timeOff.findUnique({ where: { id } })

        if (!timeOff) return new NextResponse('Not found', { status: 404 })

        if (session.user.role === 'BARBER' && session.user.id !== timeOff.barberId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        await prisma.timeOff.delete({ where: { id } })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('TimeOff delete error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}
