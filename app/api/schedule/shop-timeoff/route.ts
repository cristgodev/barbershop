import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== 'OWNER') {
        return new NextResponse('Unauthorized (Owners Only)', { status: 401 })
    }

    try {
        const body = await req.json()
        const { date, reason, barbershopId } = body

        if (!date || !barbershopId) {
            return new NextResponse('Missing fields', { status: 400 })
        }

        // Verify the user owns this shop
        if (session.user.barbershopId !== barbershopId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        const parsedDate = new Date(date)
        parsedDate.setHours(0,0,0,0) // Normalize to midnight UTC to prevent tz issues

        const timeOff = await prisma.shopTimeOff.create({
            data: {
                barbershopId,
                date: parsedDate,
                reason: reason || null
            }
        })

        return NextResponse.json(timeOff)

    } catch (error: any) {
        console.error('ShopTimeOff error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== 'OWNER') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')
        if (!id) return new NextResponse('Missing ID', { status: 400 })

        const timeOff = await prisma.shopTimeOff.findUnique({ where: { id } })

        if (!timeOff) return new NextResponse('Not found', { status: 404 })

        if (session.user.barbershopId !== timeOff.barbershopId) {
            return new NextResponse('Forbidden', { status: 403 })
        }

        await prisma.shopTimeOff.delete({ where: { id } })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('ShopTimeOff delete error:', error)
        return new NextResponse(error.message, { status: 500 })
    }
}
