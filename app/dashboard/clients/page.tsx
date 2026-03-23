import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../lib/prisma"
import ClientsListClient from "./ClientsListClient"

export default async function ClientsListPage() {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
        redirect('/login')
    }

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId },
        select: { currency: true }
    });

    return <ClientsListClient shopCurrency={shop?.currency || 'USD'} />
}
