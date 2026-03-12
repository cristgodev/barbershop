import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { prisma } from "../../lib/prisma"
import { redirect } from "next/navigation"
import AddStaffForm from "./AddStaffForm"
import Link from "next/link"

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
        <div className="max-w-6xl w-full mx-auto pb-12">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
                    <p className="text-zinc-500 mt-2">Manage your team members and their system access.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Staff List */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Current Team
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs py-0.5 px-2.5 rounded-full font-semibold">
                                {staffMembers.length}
                            </span>
                        </h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        {staffMembers.map((staff: any) => (
                            <div key={staff.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden">
                                <div className="flex items-start justify-between gap-3 mb-6">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-lg sm:text-xl font-bold text-black dark:text-white shadow-sm overflow-hidden">
                                            {staff.avatarUrl ? (
                                                <img src={staff.avatarUrl} alt={staff.name || 'Staff'} className="w-full h-full object-cover" />
                                            ) : (
                                                staff.name?.charAt(0) || 'S'
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-lg text-zinc-900 dark:text-zinc-50 truncate">{staff.name}</div>
                                            <div className="text-zinc-500 text-sm truncate">{staff.email}</div>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex items-start pt-1">
                                        <span className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-bold tracking-wider ${staff.role === 'OWNER' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' :
                                            'bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                                            }`}>
                                            {staff.role}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-3 w-full mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                                        <a href={`/dashboard/staff/${staff.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                            Edit Info
                                        </a>
                                        <a href={`/dashboard/schedule?barberId=${staff.id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            Manage Schedule
                                        </a>
                                        <a href={`/${shopSlug}/barber/${staff.id}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black bg-white border border-zinc-200 hover:border-black dark:text-white dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-white transition-colors shadow-sm">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                            View Profile
                                        </a>
                                    </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add New Staff Form */}
                <div className="w-full lg:w-[380px] shrink-0">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sticky top-28 shadow-sm">
                        <div className="mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-lg font-bold">Invite Team Member</h3>
                            <p className="text-sm text-zinc-500 mt-1">Add a new barber to your team and grant them dashboard access.</p>
                        </div>
                        <AddStaffForm barbershopId={barbershopId!} />
                    </div>
                </div>

            </div>
        </div>
    )
}
