import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { userId, bio, avatarUrl, portfolioUrls } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Only the user themselves or the OWNER of the shop can update this profile
        const isOwner = session.user.role === 'OWNER'
        const isSelf = session.user.id === userId

        if (!isOwner && !isSelf) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Ensure the user being edited belongs to the same barbershop if an OWNER is editing them
        if (isOwner && !isSelf) {
            const userToEdit = await prisma.user.findUnique({ where: { id: userId } })
            if (!userToEdit || userToEdit.barbershopId !== session.user.barbershopId) {
                return NextResponse.json({ error: 'User not found in your shop' }, { status: 404 })
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                bio: bio !== undefined ? bio : undefined,
                avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
                portfolioUrls: portfolioUrls !== undefined ? portfolioUrls : undefined,
            }
        })

        return NextResponse.json({ success: true, user: updatedUser })

    } catch (error: any) {
        console.error('Error updating profile:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
