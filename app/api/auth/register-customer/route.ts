import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Stateless signed token generator using Node built-in crypto
function generateSignedToken(payload: any, secret: string, expiresAfterMins = 10): string {
    const expiresAt = Date.now() + expiresAfterMins * 60 * 1000;
    const dataToSign = {
        ...payload,
        expiresAt
    };
    const serialized = JSON.stringify(dataToSign);
    const encodedData = Buffer.from(serialized).toString('base64url');
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(encodedData);
    const signature = hmac.digest('base64url');
    
    return `${encodedData}.${signature}`;
}

// Stateless signed token verifier
function verifySignedToken(token: string, secret: string): any | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const [encodedData, signature] = parts;
        
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(encodedData);
        const expectedSignature = hmac.digest('base64url');
        
        if (signature !== expectedSignature) return null;
        
        const serialized = Buffer.from(encodedData, 'base64url').toString('utf8');
        const data = JSON.parse(serialized);
        
        if (Date.now() > data.expiresAt) {
            return null; // Expired
        }
        
        return data;
    } catch (e) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 1. Verification Flow: If token and code are provided
        if (body.token && body.code) {
            const { token, code } = body;
            const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development';

            const decoded = verifySignedToken(token, secret);
            if (!decoded) {
                return NextResponse.json(
                    { message: 'El código de verificación ha expirado o el token es inválido. Por favor regístrate de nuevo.' },
                    { status: 400 }
                );
            }

            if (decoded.code !== code.trim()) {
                return NextResponse.json(
                    { message: 'Código de verificación incorrecto. Inténtalo de nuevo.' },
                    { status: 400 }
                );
            }

            const { name, email, phone, passwordHash } = decoded;

            // Final safety check: ensure email wasn't taken in the meantime
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return NextResponse.json(
                    { message: 'El correo electrónico ya está registrado.' },
                    { status: 409 }
                );
            }

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
        }

        // 2. Request OTP Flow: Initial sign up data submission
        const { name, email, phone, password } = body;

        if (!name || !email || !password || !phone) {
            return NextResponse.json(
                { message: 'Faltan campos obligatorios (incluyendo número de teléfono/WhatsApp)' },
                { status: 400 }
            );
        }

        // Validate syntax
        const emailLower = email.toLowerCase();
        const isTestingEmail = emailLower.includes('prueba');
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!isTestingEmail && !emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Formato de correo electrónico inválido' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'El correo electrónico ya está registrado.' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate 6-digit OTP code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Print code to server console for testing/verification
        console.log(`\n==============================================`);
        console.log(`[OTP Verification] Code for ${email} is: ${code}`);
        console.log(`==============================================\n`);

        // Sign token
        const secret = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development';
        const token = generateSignedToken({ name, email, phone, passwordHash, code }, secret, 10); // 10 mins expiry

        return NextResponse.json(
            { success: true, token, code }, // We return code for easy simulated dev notification
            { status: 200 }
        );

    } catch (error) {
        console.error('Customer Registration Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
