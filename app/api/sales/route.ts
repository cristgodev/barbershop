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
        if (!barbershopId) return NextResponse.json({ error: 'No shop associated' }, { status: 400 })

        const sales = await prisma.sale.findMany({
            where: { barbershopId },
            include: {
                barber: { select: { name: true } },
                customer: { select: { name: true } },
                items: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ success: true, sales })

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        const barberId = session.user.id
        
        if (!barbershopId) return NextResponse.json({ error: 'No shop associated' }, { status: 400 })
        
        const body = await req.json()
        const { customerId, items, paymentMethod } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items in sale' }, { status: 400 })
        }

        let totalAmount = 0
        
        const sale = await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } })
                if (!product) throw new Error(`Product ${item.productId} not found`)
                if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}`)
                
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: product.stock - item.quantity }
                })
                
                totalAmount += item.priceAtSale * item.quantity
            }

            const newSale = await tx.sale.create({
                data: {
                    barbershopId,
                    barberId,
                    customerId: customerId || null,
                    totalAmount,
                    paymentMethod: paymentMethod || 'CASH',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            priceAtSale: item.priceAtSale
                        }))
                    }
                },
                include: { items: true }
            })

            const barbershop = await tx.barbershop.findUnique({
                where: { id: barbershopId },
                select: { loyaltyRatio: true }
            })
            const ratio = barbershop?.loyaltyRatio || 5

            if (customerId) {
                const pointsToAward = totalAmount > 0 ? Math.max(1, Math.round(totalAmount / ratio)) : 0

                await tx.customerLoyalty.upsert({
                    where: {
                        userId_barbershopId: {
                            userId: customerId,
                            barbershopId: barbershopId
                        }
                    },
                    update: {
                        points: { increment: pointsToAward }
                    },
                    create: {
                        userId: customerId,
                        barbershopId: barbershopId,
                        points: pointsToAward
                    }
                })
            }

            return newSale
        })

        return NextResponse.json({ success: true, sale })

    } catch (error: any) {
        console.error('Error processing sale:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
