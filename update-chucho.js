const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
    let user = await prisma.user.findFirst({ where: { name: 'Chucho' } });
    if (!user) {
        user = await prisma.user.findFirst({ where: { role: 'OWNER' } });
        if (!user) {
            console.log('No owner/barber found at all');
            return;
        }
    }

    // copy files to public/uploads
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const brainDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\53ce6faf-5033-4553-ae1b-5199921d29c8';
    
    const filesToCopy = [
        { src: 'chucho_avatar_1773201092132.png', dest: `avatar_${Date.now()}.png` },
        { src: 'portfolio_cut_1_1773201109102.png', dest: `p1_${Date.now()}.png` },
        { src: 'portfolio_cut_2_1773201126326.png', dest: `p2_${Date.now()}.png` },
        { src: 'portfolio_cut_3_1773201142545.png', dest: `p3_${Date.now()}.png` }
    ];

    const finalUrls = [];

    for (const file of filesToCopy) {
        const srcPath = path.join(brainDir, file.src);
        if (fs.existsSync(srcPath)) {
            const destPath = path.join(uploadsDir, file.dest);
            fs.copyFileSync(srcPath, destPath);
            finalUrls.push(`/uploads/${file.dest}`);
        } else {
            console.log("Missing generated file:", srcPath);
        }
    }

    if (finalUrls.length > 0) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: 'Chucho Barber',
                avatarUrl: finalUrls[0],
                portfolioUrls: finalUrls.slice(1).join(','),
                bio: "I'm Chucho, a master edge-up and fade specialist. With over 10 years of experience, I blend classic techniques with modern trends to give you the freshest look in town. Sit back, relax, and let's craft your masterpiece."
            }
        });
        console.log(`Successfully updated profile for ${user.id}!`);
    } else {
        console.log('No files to update?');
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
