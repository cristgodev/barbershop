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
        <div className="max-w-4xl w-full mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Shop Customization</h1>
                <p className="text-zinc-500 mt-2">Personalize the look and feel of your public landing page.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                <ShopSettingsForm shop={shop} />
            </div>
        </div>
    )
}
