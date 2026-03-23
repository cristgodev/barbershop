import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) {
            return NextResponse.json({ error: 'No barbershop associated' }, { status: 400 })
        }

        const products = await prisma.product.findMany({
            where: { barbershopId },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ success: true, products })

    } catch (error: any) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized. Only management can add products' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) {
            return NextResponse.json({ error: 'No barbershop associated' }, { status: 400 })
        }

        const body = await req.json()
        const { name, description, price, stock, sku, imageUrl } = body

        if (!name || price === undefined) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
        }

        const product = await prisma.product.create({
            data: {
                barbershopId,
                name,
                description,
                price: parseFloat(price),
                stock: stock ? parseInt(stock, 10) : 0,
                sku,
                imageUrl
            }
        })

        return NextResponse.json({ success: true, product })

    } catch (error: any) {
        console.error('Error creating product:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
