import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../lib/prisma"
import LoyaltyClient from "./LoyaltyClient"

export default async function LoyaltyPage() {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
        redirect('/login')
    }

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId }
    })

    if (!shop?.isLoyaltyEnabled) {
        redirect('/dashboard') // Route protection
    }

    // Fetch clients sorted by points for this specific barbershop from CustomerLoyalty table
    const loyaltyBalances = await prisma.customerLoyalty.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            points: { gt: 0 }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        },
        orderBy: { points: 'desc' },
        take: 50
    })

    const clients = loyaltyBalances.map(lb => ({
        id: lb.user.id,
        name: lb.user.name,
        email: lb.user.email,
        phone: lb.user.phone,
        loyaltyPoints: lb.points
    }))

    // Fetch dynamic rewards
    const rewards = await prisma.loyaltyReward.findMany({
        where: { barbershopId: session.user.barbershopId },
        orderBy: { pointsCost: 'asc' }
    })

    return <LoyaltyClient clients={clients} initialRewards={rewards} />
}
