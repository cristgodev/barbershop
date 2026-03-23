import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../lib/prisma"
import InventoryClient from "./InventoryClient"

export default async function InventoryPage() {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
        redirect('/login')
    }

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId },
        select: { currency: true }
    });

    return <InventoryClient shopCurrency={shop?.currency || 'USD'} />
}
