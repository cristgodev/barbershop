import { prisma } from '../app/lib/prisma'

async function main() {
    console.log('Seeding demo tenant data...')

    // 1. Find the newest OWNER user and their barbershop
    const latestOwner = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        orderBy: { createdAt: 'desc' },
        include: { barbershop: true }
    })

    if (!latestOwner || !latestOwner.barbershop) {
        console.error('No OWNER found with a linked Barbershop. Please register a shop first.')
        process.exit(1)
    }

    const shopId = latestOwner.barbershop.id
    console.log(`Injecting data for shop: ${latestOwner.barbershop.name}`)

    // 2. Create Services if they don't exist
    const existingServices = await prisma.service.findMany({ where: { barbershopId: shopId } })

    let haircut, beardTrim;

    if (existingServices.length === 0) {
        haircut = await prisma.service.create({
            data: {
                name: 'Premium Haircut',
                description: 'Detailed fade and styling.',
                price: 35.0,
                durationMins: 45,
                barbershopId: shopId,
            },
        })

        beardTrim = await prisma.service.create({
            data: {
                name: 'Hot Towel Shave',
                description: 'Relaxing hot towel and razor shave.',
                price: 25.0,
                durationMins: 30,
                barbershopId: shopId,
            },
        })
        console.log('Created Services.')
    } else {
        haircut = existingServices[0]
        console.log('Services already exist, skipping creation.')
    }

    // 3. Create a Dummy Customer
    let customer = await prisma.user.findFirst({ where: { email: 'demo_customer@example.com' } })
    if (!customer) {
        customer = await prisma.user.create({
            data: {
                name: 'Demo Client',
                email: 'demo_customer@example.com',
                role: 'CUSTOMER',
            },
        })
        console.log('Created Dummy Customer.')
    }

    // 4. Create an Appointment for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)

    const endTime = new Date(tomorrow)
    endTime.setMinutes(endTime.getMinutes() + 45)

    await prisma.appointment.create({
        data: {
            date: tomorrow,
            startTime: tomorrow,
            endTime: endTime,
            status: 'CONFIRMED',
            customerId: customer.id,
            barberId: latestOwner.id, // Assign the owner as the barber for demo
            serviceId: haircut.id,
            barbershopId: shopId,
        },
    })

    console.log('Created Demo Appointment.')
    console.log('Database seeded successfully for tenant.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
