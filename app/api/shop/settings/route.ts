import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized. Only Owners can edit shop settings.' }, { status: 401 })
        }

        const body = await req.json()
        const { heroImageUrl, galleryUrls, name, address, phone } = body

        const updatedShop = await prisma.barbershop.update({
            where: { id: session.user.barbershopId },
            data: {
                name: name !== undefined ? name : undefined,
                address: address !== undefined ? address : undefined,
                phone: phone !== undefined ? phone : undefined,
                heroImageUrl: heroImageUrl !== undefined ? heroImageUrl : undefined,
                galleryUrls: galleryUrls !== undefined ? galleryUrls : undefined,
            }
        })

        return NextResponse.json({ success: true, shop: updatedShop })

    } catch (error: any) {
        console.error('Error updating shop settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
