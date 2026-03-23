import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import ServicesClient from "./ServicesClient"

export const dynamic = 'force-dynamic'

export default async function ServicesManagementPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'OWNER') {
        redirect("/dashboard")
    }

    const barbershopId = session.user.barbershopId

    const services = await prisma.service.findMany({
        where: { barbershopId },
        orderBy: { price: 'asc' }
    })

    const shop = await prisma.barbershop.findUnique({
        where: { id: barbershopId },
        select: { currency: true }
    })

    return (
        <ServicesClient services={services} shopCurrency={shop?.currency || 'USD'} />
    )
}
