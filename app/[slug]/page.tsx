import { prisma } from "../lib/prisma"
import { notFound } from "next/navigation"

export default async function BarbershopLandingPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params
    const slug = resolvedParams.slug

    if (['api', 'login', 'register', 'dashboard', 'book', 'favicon.ico'].includes(slug.toLowerCase())) {
        return notFound()
    }

    const shop = await prisma.barbershop.findUnique({
        where: { slug: slug },
        include: {
            services: true,
            staff: {
                where: {
                    role: {
                        in: ['OWNER', 'BARBER', 'MANAGER', 'ADMIN']
                    }
                }
            }
        }
    })

    if (!shop) {
        return notFound()
    }

    return (
        <div className="flex flex-col gap-16 pb-12 w-full max-w-6xl mx-auto px-4 mt-8">
            {/* Hero Section */}
            <section className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 justify-between">
                <div className="max-w-xl space-y-8">
                    <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        Premium grooming for the modern gentleman.
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Welcome to <span className="font-semibold text-black dark:text-white">{shop.name}</span>. {(shop as any).description || 'Experience traditional barbering combined with modern styling techniques.'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                        <a href="#staff" className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-8 py-4 rounded-xl font-semibold text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg w-full sm:w-auto text-center">
                            Book Appointment
                        </a>
                        <a href="#services" className="bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors w-full sm:w-auto text-center">
                            View Services
                        </a>
                    </div>
                </div>
                <div className="w-full md:w-5/12 aspect-square md:aspect-[4/5] bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden relative group shadow-xl">
                    {shop.heroImageUrl ? (
                        <img src={shop.heroImageUrl} alt={`${shop.name} Interior`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-400 font-medium p-6 text-center z-20">
                        {!shop.heroImageUrl && <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>}
                        <span className="text-3xl font-bold mb-2 text-white drop-shadow-md">{shop.name}</span>
                        {shop.address && <span className="text-sm opacity-90 drop-shadow-md text-zinc-200">{shop.address}</span>}
                    </div>
                </div>
            </section>

            {/* Shop Gallery (if any) */}
            {shop.galleryUrls && (
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shop.galleryUrls.split(',').map((url, i) => {
                            const trimmedUrl = url.trim()
                            if (!trimmedUrl) return null
                            return (
                                <div key={trimmedUrl + i} className="aspect-[16/9] md:aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                    <img src={trimmedUrl} alt="Shop Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Services Section */}
            <section id="services" className="space-y-10 scroll-mt-24">
                <div className="flex flex-col items-start md:items-center text-left md:text-center space-y-4 max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold tracking-tight">Our Services</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                        Choose from our range of premium grooming services designed to help you look your absolute best.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                    {shop.services && shop.services.length > 0 ? (
                        [...shop.services].sort((a, b) => a.price - b.price).map((service) => (
                            <div key={service.id} className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 rounded-2xl flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group shadow-sm hover:shadow-md">
                                <div className="flex justify-between items-start mb-4 gap-4">
                                    <h4 className="text-2xl font-bold leading-tight">{service.name}</h4>
                                    <span className="text-lg font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-1 rounded-full shrink-0">
                                        ${Number(service.price).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-8 flex-1 leading-relaxed">
                                    {service.description || "A premium service tailored to your needs. Expert attention to detail."}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70"><path d="M7.5 0.875C3.84112 0.875 0.875 3.84112 0.875 7.5C0.875 11.1589 3.84112 14.125 7.5 14.125C11.1589 14.125 14.125 11.1589 14.125 7.5C14.125 3.84112 11.1589 0.875 7.5 0.875ZM1.825 7.5C1.825 4.36538 4.36538 1.825 7.5 1.825C10.6346 1.825 13.175 4.36538 13.175 7.5C13.175 10.6346 10.6346 13.175 7.5 13.175C4.36538 13.175 1.825 10.6346 1.825 7.5ZM8 4.5C8 4.22386 7.77614 4 7.5 4C7.22386 4 7 4.22386 7 4.5V7.5C7 7.63261 7.05268 7.75979 7.14645 7.85355L9.14645 9.85355C9.34171 10.0488 9.65829 10.0488 9.85355 9.85355C10.0488 9.65829 10.0488 9.34171 9.85355 9.14645L8 7.29289V4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                        {service.durationMins} mins
                                    </span>
                                    <a href="#staff" className="text-sm font-semibold text-black dark:text-white hover:underline flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Book <span aria-hidden="true">&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-zinc-500 py-12 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p>No services defined yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Staff Section */}
            <section id="staff" className="space-y-10 py-16 border-t border-zinc-200 dark:border-zinc-800 scroll-mt-24">
                <div className="flex flex-col items-start md:items-center text-left md:text-center space-y-4 max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold tracking-tight">Our Expert Barbers</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                        Select a barber below to view their availability and book your appointment.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                    {shop.staff.filter(s => s.role === 'BARBER' || s.role === 'MANAGER' || s.role === 'ADMIN' || s.role === 'OWNER').map((member) => (
                        <a href={`/${slug}/barber/${member.id}`} key={member.id} className="flex flex-col items-center text-center space-y-5 p-4 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-3xl transition-colors">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-4xl overflow-hidden shrink-0 group-hover:ring-4 group-hover:ring-zinc-100 dark:group-hover:ring-zinc-800 transition-all shadow-md">
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.name || 'Barber'} className="w-full h-full object-cover" />
                                ) : (
                                    member.name?.charAt(0) || 'B'
                                )}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-xl group-hover:underline">{member.name}</h4>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{member.role === 'OWNER' ? 'BARBER (OWNER)' : member.role}</p>
                            </div>
                            <div className="mt-2 text-sm font-semibold text-black dark:text-white flex items-center gap-1 group-hover:gap-2 transition-all opacity-0 group-hover:opacity-100">
                                View Profile <span aria-hidden="true">&rarr;</span>
                            </div>
                        </a>
                    ))}
                </div>
            </section>



        </div>
    )
}
