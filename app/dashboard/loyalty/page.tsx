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

    // Fetch clients sorted by points
    const clients = await prisma.user.findMany({
        where: { role: 'CUSTOMER', loyaltyPoints: { gt: 0 } },
        select: { id: true, name: true, email: true, phone: true, loyaltyPoints: true },
        orderBy: { loyaltyPoints: 'desc' },
        take: 50
    })

    return <LoyaltyClient clients={clients} />
}
