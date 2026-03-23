import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../lib/prisma"
import PosClient from "./PosClient"

export default async function PosPage() {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
        redirect('/login')
    }

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId },
        select: { currency: true }
    })

    return <PosClient barbershopId={session.user.barbershopId!} shopCurrency={shop?.currency || 'USD'} />
}
