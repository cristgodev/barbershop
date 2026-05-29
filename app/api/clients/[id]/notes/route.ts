import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../app/lib/auth'
import { prisma } from '../../../../../app/lib/prisma'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const clientId = resolvedParams.id
        const barbershopId = session.user.barbershopId

        if (!barbershopId) {
            return NextResponse.json({ error: 'No barbershop associated with user' }, { status: 400 })
        }

        // Get notes, appointments, client user and barbershop info
        const [notes, appointments, clientUser, barbershop] = await Promise.all([
            prisma.clientNote.findMany({
                where: { 
                    customerId: clientId,
                    barbershopId: barbershopId
                },
                include: {
                    author: {
                        select: { name: true, role: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.appointment.findMany({
                where: {
                    customerId: clientId,
                    barbershopId: barbershopId
                },
                include: {
                    barber: { select: { name: true } },
                    service: { select: { name: true, price: true } }
                },
                orderBy: { date: 'desc' }
            }),
            prisma.user.findUnique({
                where: { id: clientId },
                select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true }
            }),
            prisma.barbershop.findUnique({
                where: { id: barbershopId },
                select: { slug: true, name: true }
            })
        ]);

        if (!clientUser) {
             return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        return NextResponse.json({ 
            success: true, 
            client: clientUser,
            notes, 
            appointments,
            shopSlug: barbershop?.slug,
            shopName: barbershop?.name
        })

    } catch (error: any) {
        console.error('Error fetching client details:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const clientId = resolvedParams.id
        const barbershopId = session.user.barbershopId

        if (!barbershopId) {
            return NextResponse.json({ error: 'No barbershop' }, { status: 400 })
        }

        const { content } = await req.json()
        
        if (!content || typeof content !== 'string') {
            return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
        }

        const note = await prisma.clientNote.create({
            data: {
                content,
                customerId: clientId,
                barbershopId: barbershopId,
                authorId: session.user.id
            },
            include: {
                author: { select: { name: true, role: true } }
            }
        });

        return NextResponse.json({ success: true, note })

    } catch (error: any) {
        console.error('Error adding client note:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
