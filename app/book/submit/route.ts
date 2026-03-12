import { prisma } from "../../lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"

export async function POST(request: Request) {
    const formData = await request.formData()

    const barbershopId = formData.get("barbershopId") as string
    const serviceId = formData.get("serviceId") as string
    const barberId = formData.get("barberId") as string
    const dateStr = formData.get("date") as string
    const timeStr = formData.get("time") as string

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
        return new Response("Unauthorized. Please log in to book.", { status: 401 })
    }

    const customerId = session.user.id

    const missingFields = []
    if (!customerId) missingFields.push("customerId")
    if (!barbershopId) missingFields.push("barbershopId")
    if (!serviceId) missingFields.push("serviceId")
    if (!barberId) missingFields.push("barberId")
    if (!dateStr) missingFields.push("date")
    if (!timeStr) missingFields.push("time")

    if (missingFields.length > 0) {
        console.error("Missing booking fields:", missingFields)
        return new Response(`Missing fields: ${missingFields.join(", ")}`, { status: 400 })
    }

    // Combine date and time
    const startDateTime = new Date(`${dateStr}T${timeStr}`)

    // Get service duration
    const service = await prisma.service.findUnique({
        where: { id: serviceId }
    })

    if (!service) {
        return new Response("Service not found", { status: 404 })
    }

    const endDateTime = new Date(startDateTime.getTime() + service.durationMins * 60000)

    // Check for double booking (overlapping appointments)
    const existingAppointment = await prisma.appointment.findFirst({
        where: {
            barberId: barberId,
            status: {
                not: 'CANCELLED'
            },
            OR: [
                {
                    // New appointment starts during an existing one
                    startTime: { lte: startDateTime },
                    endTime: { gt: startDateTime }
                },
                {
                    // New appointment ends during an existing one
                    startTime: { lt: endDateTime },
                    endTime: { gte: endDateTime }
                },
                {
                    // New appointment completely encompasses an existing one
                    startTime: { gte: startDateTime },
                    endTime: { lte: endDateTime }
                }
            ]
        }
    })

    if (existingAppointment) {
        return new Response("This time slot is no longer available for the selected barber.", { status: 409 })
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
        data: {
            customerId,
            barbershopId,
            serviceId,
            barberId,
            date: startDateTime,
            startTime: startDateTime,
            endTime: endDateTime,
            status: 'PENDING'
        },
        include: { customer: true, barber: true }
    })

    // Simulate WhatsApp API integration in local mode
    console.log(`[WHATSAPP API SIMULATION] ---------------------------------------`)
    console.log(`To Customer (${appointment.customer.phone || 'No phone'}): Hola ${appointment.customer.name}, tu cita esta confirmada.`)
    console.log(`To Barber (${appointment.barber.name}): Nuevo turno reservado para ${appointment.customer.name}.`)
    console.log(`------------------------------------------------------------------`)

    // Redirect to the dedicated success ticket page
    redirect(`/book/success/${appointment.id}`)
}
