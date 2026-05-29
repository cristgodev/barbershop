import { prisma } from '../app/lib/prisma';

async function main() {
  const slug = "chucho-barber";
  const barberId = "cmmtle595000346vbv71a2g03";

  try {
    console.log("Querying shop and staff...");
    const shop = await prisma.barbershop.findUnique({
        where: { slug: slug },
        include: {
            services: true,
            staff: {
                where: {
                    id: barberId,
                    role: {
                        in: ['OWNER', 'BARBER', 'MANAGER', 'ADMIN']
                    }
                }
            }
        }
    });

    console.log("Shop found:", shop ? shop.name : "null");
    console.log("Staff count:", shop ? shop.staff.length : 0);

    if (shop && shop.staff.length > 0) {
      const barber = shop.staff[0];
      const schedules = await prisma.schedule.findMany({ where: { barberId: barber.id } });
      console.log("Schedules count:", schedules.length);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const timeOffs = await prisma.timeOff.findMany({ 
          where: { 
              barberId: barber.id, 
              date: { gte: startOfToday } 
          } 
      });
      console.log("Timeoffs count:", timeOffs.length);

      const appointments = await prisma.appointment.findMany({
          where: {
              barberId: barber.id,
              date: { gte: startOfToday },
              status: { in: ['CONFIRMED', 'PENDING'] }
          },
          include: {
              service: {
                  select: { durationMins: true }
              }
          }
      });
      console.log("Appointments count:", appointments.length);

      const shopTimeOffs = await prisma.shopTimeOff.findMany({
          where: {
              barbershopId: shop.id,
              date: { gte: startOfToday }
          }
      });
      console.log("Shop timeoffs count:", shopTimeOffs.length);
    }
  } catch (error: any) {
    console.error("Query failed:", error);
  }
}

main().finally(() => prisma.$disconnect());
