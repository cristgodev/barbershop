import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { notFound, redirect } from "next/navigation"
import EditProfileForm from "./EditProfileForm"

export default async function EditStaffProfilePage({ params }: { params: Promise<{ employeeId: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
        redirect('/dashboard')
    }

    const { employeeId } = await params

    const staffMember = await prisma.user.findUnique({
        where: {
            id: employeeId,
            barbershopId: session.user.barbershopId
        }
    })

    if (!staffMember) {
        return notFound()
    }

    return (
        <div className="max-w-3xl w-full mx-auto pb-12">
            <div className="mb-8">
                <a href="/dashboard/staff" className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white mb-4 inline-block transition-colors">&larr; Back to Staff List</a>
                <h1 className="text-3xl font-bold tracking-tight">Edit Profile: {staffMember.name}</h1>
                <p className="text-zinc-500 mt-2">Customize the public appearance of this barber on your booking page.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                <EditProfileForm user={staffMember} />
            </div>
        </div>
    )
}
