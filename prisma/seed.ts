import { prisma } from '../app/lib/prisma'

async function main() {
    console.log('Seeding database...')

    // Clear existing
    await prisma.appointment.deleteMany()
    await prisma.service.deleteMany()
    await prisma.user.deleteMany()
    await prisma.barbershop.deleteMany()

    // 1. Create a Barbershop
    const shop = await prisma.barbershop.create({
        data: {
            name: 'The Sharp Fade',
            address: '123 Main St, Cityville',
            phone: '555-0100',
        },
    })

    // 2. Create Services
    const haircut = await prisma.service.create({
        data: {
            name: 'Classic Haircut',
            description: 'Standard scissors and clippers cut.',
            price: 30.0,
            durationMins: 30,
            barbershopId: shop.id,
        },
    })

    const beardTrim = await prisma.service.create({
        data: {
            name: 'Beard Trim',
            description: 'Sculpting and conditioning.',
            price: 20.0,
            durationMins: 20,
            barbershopId: shop.id,
        },
    })

    // 3. Create Users
    const barber = await prisma.user.create({
        data: {
            name: 'John Barber',
            email: 'john@sharpfade.com',
            role: 'BARBER',
            barbershopId: shop.id,
        },
    })

    const customer = await prisma.user.create({
        data: {
            name: 'Alice Customer',
            email: 'alice@example.com',
            role: 'CUSTOMER',
        },
    })

    // 4. Create an Appointment
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const endTime = new Date(tomorrow)
    endTime.setMinutes(endTime.getMinutes() + 30)

    await prisma.appointment.create({
        data: {
            date: tomorrow,
            startTime: tomorrow,
            endTime: endTime,
            status: 'CONFIRMED',
            customerId: customer.id,
            barberId: barber.id,
            serviceId: haircut.id,
            barbershopId: shop.id,
        },
    })

    console.log('Database seeded successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
