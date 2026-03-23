import { prisma } from './app/lib/prisma';

async function main() {
  const shop = await prisma.barbershop.findFirst({
    where: { name: { contains: 'Chucho' } }
  });

  if (!shop) return;
  
  const heroImage = "/uploads/chucho_hero.png";
  const chuchoImage = "/uploads/chucho_avatar.png";
  const alexImage = "/uploads/alexander_avatar.png";

  await prisma.barbershop.update({
    where: { id: shop.id },
    data: {
      heroImageUrl: heroImage,
    }
  });

  const users = await prisma.user.findMany({
    where: { barbershopId: shop.id }
  });

  const owner = users.find(u => u.role === 'OWNER');
  if (owner) {
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        bio: 'Fundador y maestro barbero con más de 10 años de experiencia internacional. Especialista en diseños y afeitados premium a navaja libre.',
        avatarUrl: chuchoImage,
      }
    });

    const existingSchedule = await prisma.schedule.findFirst({
      where: { barberId: owner.id }
    });
    if (!existingSchedule) {
      for (const day of [1, 2, 3, 4, 5, 6]) {
        await prisma.schedule.create({
          data: {
            barberId: owner.id,
            dayOfWeek: day,
            startTime: '10:00',
            endTime: '20:00',
            isWorkingDay: true
          }
        });
      }
    }
  }

  const alexander = users.find(u => u.name === 'Alexander');
  if (alexander) {
    await prisma.user.update({
      where: { id: alexander.id },
      data: {
        bio: 'Barbero de la nueva escuela, apasionado por los fades perfectos y la atención al detalle. Tu estilo, elevado al máximo nivel.',
        avatarUrl: alexImage,
      }
    });

    const existingSchedule = await prisma.schedule.findFirst({
      where: { barberId: alexander.id }
    });
    if (!existingSchedule) {
      for (const day of [1, 2, 3, 4, 5, 6]) {
        await prisma.schedule.create({
          data: {
            barberId: alexander.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            isWorkingDay: true
          }
        });
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
