import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name } = body

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Shope name is required' }, { status: 400 })
        }

        // Check if user already has a shop
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (currentUser.barbershopId) {
            return NextResponse.json({ error: 'You already own a barbershop.' }, { status: 400 })
        }

        // Generate base slug
        let baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
        if (!baseSlug) baseSlug = 'shop'
        
        // Ensure slug uniqueness
        let finalSlug = baseSlug
        let counter = 1
        while (true) {
            const existingShop = await prisma.barbershop.findUnique({
                where: { slug: finalSlug }
            })
            if (!existingShop) break
            finalSlug = `${baseSlug}-${counter}`
            counter++
        }

        // Create the new Barbershop and update User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const newShop = await tx.barbershop.create({
                data: {
                    name: name.trim(),
                    slug: finalSlug,
                }
            })

            await tx.user.update({
                where: { id: currentUser.id },
                data: {
                    barbershopId: newShop.id,
                    role: 'OWNER'
                }
            })

            return newShop
        })

        return NextResponse.json({ success: true, shop: result })

    } catch (error: any) {
        console.error('Onboarding Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
