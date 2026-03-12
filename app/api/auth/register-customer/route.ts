import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, password } = body;

        if (!name || !email || !password) {
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

        // Create User as CUSTOMER
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone: phone || null,
                passwordHash,
                role: 'CUSTOMER',
            },
        });

        return NextResponse.json(
            { message: 'Registration successful', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Customer Registration Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
