import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Cambia este correo por el tuyo
  const email = "cristgodev@gmail.com";
  // Cambia esta contraseña por la nueva que quieras usar
  const newPassword = "admin"; 

  const passwordHash = await bcrypt.hash(newPassword, 10);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    console.log(`✅ Contraseña actualizada correctamente para: ${user.email}`);
    console.log(`🔑 Nueva contraseña: ${newPassword}`);
  } catch (error) {
    console.error(`❌ Error al actualizar. Verifica que el correo ${email} exista en la base de datos.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
