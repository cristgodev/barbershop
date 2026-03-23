import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import ShopSettingsForm from "./ShopSettingsForm"

export default async function ShopSettingsPage() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
        redirect('/dashboard')
    }

    const shop = await prisma.barbershop.findUnique({
        where: { id: session.user.barbershopId }
    })

    if (!shop) {
        redirect('/dashboard')
    }

    return (
        <ShopSettingsForm shop={shop} />
    )
}
