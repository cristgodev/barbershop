import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { prisma } from "../../lib/prisma"
import { redirect } from "next/navigation"
import StaffClient from "./StaffClient"

export const dynamic = 'force-dynamic'

export default async function StaffManagementPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        redirect("/login")
    }

    if (session.user.role !== 'OWNER') {
        redirect("/dashboard")
    }

    const barbershopId = session.user.barbershopId

    const staffMembers = await prisma.user.findMany({
        where: { barbershopId },
        orderBy: { createdAt: 'asc' }
    })

    const shop = await prisma.barbershop.findUnique({
        where: { id: barbershopId },
        select: { slug: true }
    })

    const shopSlug = shop?.slug || ''

    return (
        <StaffClient staffMembers={staffMembers} shopSlug={shopSlug} barbershopId={barbershopId!} />
    )
}
