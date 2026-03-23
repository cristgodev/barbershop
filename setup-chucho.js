const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const shop = await prisma.barbershop.findFirst({
    where: {
      name: { contains: 'Chucho' }
    }
  });

  if (!shop) {
    console.log('Shop not found');
    return;
  }
  
  console.log('Found Shop:', shop);

  // Default images (will be replaced by absolute paths from generated images)
  const heroImage = "/uploads/chucho_hero.png";
  const chuchoImage = "/uploads/chucho_avatar.png";
  const alexImage = "/uploads/alexander_avatar.png";

  // Update shop details
  await prisma.barbershop.update({
    where: { id: shop.id },
    data: {
      description: 'Bienvenido a Chucho Barber. Ofrecemos una experiencia de "Grooming" premium para el caballero moderno. Nuestro equipo de expertos domina desde cortes clásicos hasta los estilos más vanguardistas.',
      address: 'Calle Principal 123, Ciudad de México',
      phone: '+52 55 1234 5678',
      heroImageUrl: heroImage,
    }
  });

  console.log('Updated shop settings.');

  // Find users for this shop
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
    console.log('Updated owner Chucho.');
  }

  // Create a new barber
  const hashed = await bcrypt.hash('password123', 10);
  const newBarber = await prisma.user.create({
    data: {
      name: 'Alexander',
      email: 'alexander@chuchobarber.com',
      password: hashed,
      role: 'BARBER',
      barbershopId: shop.id,
      bio: 'Barbero de la nueva escuela, apasionado por los fades perfectos y la atención al detalle. Tu estilo, elevado al máximo nivel.',
      avatarUrl: alexImage,
    }
  });

  // Create schedule for new barber
  await prisma.schedule.create({
    data: {
      userId: newBarber.id,
      days: [1, 2, 3, 4, 5, 6], // Mon-Sat
      startTime: '09:00',
      endTime: '18:00'
    }
  });
  
  console.log('Created new barber Alexander. DONE');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
