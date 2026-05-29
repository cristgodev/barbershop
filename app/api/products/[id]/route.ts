import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const productId = resolvedParams.id
        const barbershopId = session.user.barbershopId

        if (!barbershopId) {
            return NextResponse.json({ error: 'No shop associated' }, { status: 400 })
        }

        // BOLA/IDOR protection: verify product ownership
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        })
        if (!existingProduct || existingProduct.barbershopId !== barbershopId) {
            return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 })
        }
        
        const body = await req.json()
        const { name, description, price, stock, sku, imageUrl } = body

        const updatedData: any = {}
        if (name !== undefined) updatedData.name = name
        if (description !== undefined) updatedData.description = description
        if (price !== undefined) updatedData.price = parseFloat(price)
        if (stock !== undefined) updatedData.stock = parseInt(stock, 10)
        if (sku !== undefined) updatedData.sku = sku
        if (imageUrl !== undefined) updatedData.imageUrl = imageUrl

        const product = await prisma.product.update({
            where: { id: productId },
            data: updatedData
        })

        return NextResponse.json({ success: true, product })

    } catch (error: any) {
        console.error('Error updating product:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const resolvedParams = await params
        const productId = resolvedParams.id
        const barbershopId = session.user.barbershopId

        if (!barbershopId) {
            return NextResponse.json({ error: 'No shop associated' }, { status: 400 })
        }

        // BOLA/IDOR protection: verify product ownership
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        })
        if (!existingProduct || existingProduct.barbershopId !== barbershopId) {
            return NextResponse.json({ error: 'Product not found or access denied' }, { status: 404 })
        }

        await prisma.product.delete({
            where: { id: productId }
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
