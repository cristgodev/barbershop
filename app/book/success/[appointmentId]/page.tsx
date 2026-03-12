import { prisma } from "../../../lib/prisma"
import { redirect } from "next/navigation"

export default async function BookingSuccessPage({ params }: { params: Promise<{ appointmentId: string }> }) {
    const resolvedParams = await params
    const appointmentId = resolvedParams.appointmentId

    // Fetch the detailed appointment
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            barbershop: true,
            service: true,
            barber: true,
            customer: true
        }
    })

    if (!appointment) {
        redirect('/book')
    }

    // Format date and time safely
    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 bg-zinc-50 dark:bg-zinc-950 py-12">

            {/* Premium Wallet Style Ticket Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-[400px] shadow-2xl overflow-hidden relative border border-zinc-200/50 dark:border-zinc-800/50">
                {/* Stripe-style gradient top accent */}
                <div className="h-3 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shrink-0" />
                
                <div className="p-8 md:p-10 pt-12">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/40 ring-4 ring-green-50 dark:ring-green-900/20">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xs font-bold tracking-widest text-zinc-400 uppercase mb-3">
                            Booking Confirmed
                        </h2>
                        <p className="text-5xl font-extrabold text-black dark:text-white mb-2 tracking-tight">
                            ${Number(appointment.service.price).toFixed(2)}
                        </p>
                        <p className="text-zinc-500 font-medium text-lg mt-2">
                            {appointment.barbershop.name}
                        </p>
                    </div>

                    <div className="space-y-5 pt-8 border-t border-zinc-100 dark:border-zinc-800/60">
                        <div className="flex justify-between items-center text-[15px]">
                            <span className="text-zinc-500 font-medium">Service</span>
                            <span className="font-bold text-right text-black dark:text-white">{appointment.service.name}</span>
                        </div>
                        <div className="flex justify-between items-start text-[15px]">
                            <span className="text-zinc-500 font-medium pt-1">Date & Time</span>
                            <span className="font-bold text-right text-black dark:text-white">{formattedDate} <br/> <span className="text-zinc-400 font-medium">{formattedTime}</span></span>
                        </div>
                        <div className="flex justify-between items-center text-[15px]">
                            <span className="text-zinc-500 font-medium">Barber</span>
                            <span className="font-bold text-right text-black dark:text-white">{appointment.barber?.name || 'Staff'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[15px]">
                            <span className="text-zinc-500 font-medium">Customer</span>
                            <span className="font-bold text-right text-black dark:text-white">{appointment.customer?.name || 'Guest'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950/60 p-8 flex flex-col items-center border-t border-zinc-100 dark:border-zinc-800/60 mt-4 rounded-b-[2.5rem]">
                    {/* Simulated barcode */}
                    <div className="w-full h-14 flex justify-between items-center opacity-20 dark:opacity-40 mb-4 px-2">
                        {[...Array(35)].map((_, i) => (
                            <div key={i} className="bg-black dark:bg-white h-full rounded-sm" style={{ width: Math.max(1.5, Math.random() * 5) + 'px' }}></div>
                        ))}
                    </div>
                    <p className="font-mono text-zinc-400 dark:text-zinc-500 text-xs tracking-[0.25em] break-all uppercase text-center">
                        {appointment.id.split('-').join('')}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 w-full max-w-[400px]">
                {/* Whatsapp for Customer */}
                <a 
                    target="_blank" 
                    rel="noopener noreferrer"
                    href={`https://wa.me/${appointment.customer.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(`🎟️ *TICKET DE RESERVA*\n\nHola ${appointment.customer.name},\nTu cita en *${appointment.barbershop.name}* está confirmada.\n\n💇‍♂️ Servicio: ${appointment.service.name}\n💈 Barbero: ${appointment.barber.name || 'Staff'}\n📅 Fecha: ${formattedDate} a las ${formattedTime}\n💵 Total: $${Number(appointment.service.price).toFixed(2)}\n\n¡Te esperamos!`)}`} 
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-transform active:scale-[0.98] shadow-sm"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.062-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    Send Ticket to my WhatsApp
                </a>

                {/* Back to Home */}
                <a 
                    href={`/${appointment.barbershop.slug}`} 
                    className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-6 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors mt-2"
                >
                    Return to Shop
                </a>
            </div>

        </div>
    )
}
