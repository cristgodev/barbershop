import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../lib/prisma"
import MarketingClient from "./MarketingClient"

export default async function MarketingPage() {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
        redirect('/login')
    }

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId }
    })

    if (!shop?.isMarketingEnabled) {
        redirect('/dashboard') // Route protection
    }

    // Fetch clients with their no-show counts
    const clients = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: { id: true, name: true, email: true, phone: true, noShowCount: true },
        orderBy: { noShowCount: 'desc' },
    })

    return <MarketingClient clients={clients} />
}
