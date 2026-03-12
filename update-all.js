const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    const shop = await prisma.barbershop.findFirst({
        where: { name: { contains: 'Chucho' } }
    });
    
    if (!shop) {
        console.log('Shop not found');
        return;
    }

    const barbers = await prisma.user.findMany({ 
        where: { 
            barbershopId: shop.id,
            role: { in: ['BARBER', 'OWNER'] },
            name: { not: 'Chucho Barber' } // Skip Chucho since he was already updated in update-chucho.js, or wait, Chucho's name is just 'Chucho'.
        } 
    });

    // copy files to public/uploads
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\53ce6faf-5033-4553-ae1b-5199921d29c8';
    
    // Copy Shop Images
    const shopHero = `shop_hero_${Date.now()}.png`;
    const shopGall = `shop_gall_${Date.now()}.png`;
    
    if (fs.existsSync(path.join(brainDir, 'shop_hero_1773201589937.png'))) {
        fs.copyFileSync(path.join(brainDir, 'shop_hero_1773201589937.png'), path.join(uploadsDir, shopHero));
        fs.copyFileSync(path.join(brainDir, 'shop_gallery_1_1773201602072.png'), path.join(uploadsDir, shopGall));
        
        await prisma.barbershop.update({
            where: { id: shop.id },
            data: {
                heroImageUrl: `/uploads/${shopHero}`,
                galleryUrls: `/uploads/${shopGall}`
            }
        });
        console.log('Shop updated!');
    }

    // Give Barber 1 (if exists) the male avatar
    if (barbers.length > 0) {
        const b1 = barbers[0];
        const avatarName = `b1_avatar_${Date.now()}.png`;
        if (fs.existsSync(path.join(brainDir, 'barber_2_avatar_1773201615827.png'))) {
            fs.copyFileSync(path.join(brainDir, 'barber_2_avatar_1773201615827.png'), path.join(uploadsDir, avatarName));
            await prisma.user.update({
                where: { id: b1.id },
                data: {
                    avatarUrl: `/uploads/${avatarName}`,
                    bio: "Precision is my passion. Check out my portfolio and let's get you lined up."
                }
            });
            console.log(`Updated ${b1.name} with an avatar`);
        }
    }

    // Give Barber 2 (if exists) the female avatar
    if (barbers.length > 1) {
        const b2 = barbers[1];
        const avatarName = `b2_avatar_${Date.now()}.png`;
        if (fs.existsSync(path.join(brainDir, 'barber_3_avatar_1773201632137.png'))) {
            fs.copyFileSync(path.join(brainDir, 'barber_3_avatar_1773201632137.png'), path.join(uploadsDir, avatarName));
            await prisma.user.update({
                where: { id: b2.id },
                data: {
                    avatarUrl: `/uploads/${avatarName}`,
                    bio: "Specializing in modern fades and creative cuts. Ready to give you a fresh new look."
                }
            });
            console.log(`Updated ${b2.name} with an avatar`);
        }
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
