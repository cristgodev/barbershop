import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting appointment seed...')

  // Find shop
  const shop = await prisma.barbershop.findFirst({
    where: {
      name: { contains: 'chucho', mode: 'insensitive' }
    },
    include: {
      staff: true,
      services: true
    }
  })

  if (!shop) {
    console.error('Barbershop "chucho barber" not found!')
    process.exit(1)
  }

  console.log(`Found shop: ${shop.name}`)

  const barbers = shop.staff.filter(s => s.role === 'BARBER' || s.role === 'OWNER')
  if (barbers.length === 0) {
    console.error('No barbers found in this shop!')
    process.exit(1)
  }

  if (shop.services.length === 0) {
    console.error('No services found in this shop!')
    process.exit(1)
  }

  // Get or create a dummy customer
  let customer = await prisma.user.findFirst({
    where: { role: 'CUSTOMER' }
  })

  if (!customer) {
    customer = await prisma.user.create({
      data: {
        email: 'dummy_customer@example.com',
        name: 'Cliente Prueba',
        role: 'CUSTOMER'
      }
    })
  }

  console.log(`Using customer: ${customer.name}`)

  // Generate appointments for this week
  // Today is approx May 6, 2026
  const today = new Date()
  
  // Get monday of this week
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  const monday = new Date(today.setDate(diff))
  monday.setHours(0,0,0,0)

  const appointmentsToCreate = []
  
  // Create ~25 appointments across the week
  for (let i = 0; i < 25; i++) {
    const randomBarber = barbers[Math.floor(Math.random() * barbers.length)]
    const randomService = shop.services[Math.floor(Math.random() * shop.services.length)]
    
    // Random day (Monday to Saturday) -> offset 0 to 5
    const dayOffset = Math.floor(Math.random() * 6)
    
    // Random hour (9 AM to 6 PM)
    const hour = 9 + Math.floor(Math.random() * 9)
    // Random minute (0 or 30)
    const minute = Math.random() > 0.5 ? 0 : 30

    const startTime = new Date(monday)
    startTime.setDate(monday.getDate() + dayOffset)
    startTime.setHours(hour, minute, 0, 0)
    
    // Use the start date for the base 'date' field
    const dateOnly = new Date(startTime)
    dateOnly.setUTCHours(0,0,0,0)

    const endTime = new Date(startTime.getTime() + randomService.durationMins * 60000)

    // Random status
    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED']
    
    // Make past appointments completed, future appointments pending/confirmed
    const now = new Date()
    let status = 'PENDING'
    if (endTime < now) {
        status = Math.random() > 0.2 ? 'COMPLETED' : 'PENDING' // mostly completed
    } else {
        status = Math.random() > 0.5 ? 'CONFIRMED' : 'PENDING'
    }

    appointmentsToCreate.push({
      date: dateOnly,
      startTime,
      endTime,
      status,
      customerId: customer.id,
      barberId: randomBarber.id,
      serviceId: randomService.id,
      barbershopId: shop.id
    })
  }

  console.log(`Creating ${appointmentsToCreate.length} appointments...`)

  let created = 0
  for (const apt of appointmentsToCreate) {
    try {
        await prisma.appointment.create({ data: apt })
        created++
    } catch (e) {
        // Ignore overlaps/errors to keep it simple
    }
  }

  console.log(`Successfully created ${created} appointments!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
