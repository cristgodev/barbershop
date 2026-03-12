import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { barbershopName, ownerName, email, password } = body;

        if (!barbershopName || !ownerName || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Run transaction to create Barbershop and User
        const result = await prisma.$transaction(async (tx) => {
            // Generate slug
            const baseSlug = barbershopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            let slug = baseSlug || 'shop';
            const existingSlug = await tx.barbershop.findUnique({ where: { slug } });
            if (existingSlug) {
                slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
            }

            // 1. Create Barbershop
            const barbershop = await tx.barbershop.create({
                data: {
                    name: barbershopName,
                    slug: slug,
                },
            });

            // 2. Create User as OWNER and connect to Barbershop
            const user = await tx.user.create({
                data: {
                    name: ownerName,
                    email: email,
                    passwordHash: passwordHash,
                    role: 'OWNER',
                    barbershopId: barbershop.id,
                },
            });

            return { barbershop, user };
        });

        return NextResponse.json(
            { message: 'Registration successful', userId: result.user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
