import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "../../../lib/prisma"
import ClientProfileClient from "./ClientProfileClient"

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)

    if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
        redirect('/login')
    }

    const { id } = await params

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId },
        select: { currency: true }
    });

    return <ClientProfileClient clientId={id} shopCurrency={shop?.currency || 'USD'} />
}
