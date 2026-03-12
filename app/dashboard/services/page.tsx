import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import AddServiceForm from "./AddServiceForm"
import ServicesList from "./ServicesList"

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

    return (
        <div className="max-w-6xl w-full mx-auto pb-12">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Services Menu</h2>
                    <p className="text-zinc-500 mt-2">Manage the services offered at your barbershop.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Services List */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Current Services
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs py-0.5 px-2.5 rounded-full font-semibold">
                                {services.length}
                            </span>
                        </h3>
                    </div>

                    <ServicesList initialServices={services} />
                </div>

                {/* Add Service Form */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sticky top-28 shadow-sm">
                        <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-lg font-bold">Add New Service</h3>
                            <p className="text-sm text-zinc-500 mt-1">Create a new item for your menu.</p>
                        </div>
                        <AddServiceForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
