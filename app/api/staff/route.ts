import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import bcrypt from 'bcryptjs'
import dns from 'dns'

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    // Only logged in OWNERS can add staff
    if (!session || !session.user || session.user.role !== 'OWNER') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, email, password, barbershopId, phone } = body

        if (!name || !email || !password || !phone || !barbershopId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Email syntax and domain validation
        const emailLower = email.toLowerCase()
        const isTestingEmail = emailLower.includes('prueba')

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!isTestingEmail && !emailRegex.test(email)) {
            return NextResponse.json({ error: 'invalid_email_format' }, { status: 400 })
        }

        // DNS domain existence check (skipped for testing domains)
        if (!isTestingEmail) {
            const domain = email.split('@')[1]
            let domainExists = true // Default to true (fail-safe for local connection/firewall errors)

            try {
                const mxRecords = await dns.promises.resolveMx(domain)
                if (!mxRecords || mxRecords.length === 0) {
                    throw { code: 'ENODATA', message: 'No MX records' }
                }
            } catch (mxError: any) {
                // If it is a definitive negative response from DNS server, check A records
                if (mxError.code === 'ENOTFOUND' || mxError.code === 'ENODATA') {
                    try {
                        const aRecords = await dns.promises.resolve(domain, 'A')
                        if (!aRecords || aRecords.length === 0) {
                            domainExists = false
                        }
                    } catch (aError: any) {
                        if (aError.code === 'ENOTFOUND' || aError.code === 'ENODATA') {
                            domainExists = false
                        }
                    }
                }
                // If it is a connection/network/refused error (e.g. ECONNREFUSED), we fail-safe (keep domainExists = true)
            }

            if (!domainExists) {
                return NextResponse.json({ error: 'invalid_email_domain' }, { status: 400 })
            }
        }

        // Validate the shop belongs to the owner
        if (session.user.barbershopId !== barbershopId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'email_in_use' }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        // Create the BARBER user
        const newStaff = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                passwordHash,
                role: 'BARBER',
                barbershopId
            }
        })

        // Also give them a default schedule
        const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6]
        await prisma.schedule.createMany({
            data: DAYS_OF_WEEK.map(day => ({
                barberId: newStaff.id,
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '18:00',
                isWorkingDay: day >= 1 && day <= 5 // Mon-Fri
            }))
        })

        return NextResponse.json({ success: true, user: { id: newStaff.id, name: newStaff.name } })

    } catch (error: any) {
        console.error('Add Staff error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)

    // Only logged in OWNERS can delete staff
    if (!session || !session.user || session.user.role !== 'OWNER') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const barberId = searchParams.get('id')

    if (!barberId) {
        return NextResponse.json({ error: 'Missing barber ID' }, { status: 400 })
    }

    try {
        // 1. Verify the barber exists and belongs to the owner's shop
        const barber = await prisma.user.findUnique({
            where: { id: barberId },
        })

        if (!barber || barber.barbershopId !== session.user.barbershopId) {
            return NextResponse.json({ error: 'Barber not found or access denied' }, { status: 404 })
        }

        // Owners cannot delete themselves!
        if (barber.id === session.user.id) {
            return NextResponse.json({ error: 'No puedes eliminarte a ti mismo.' }, { status: 400 })
        }

        // 2. Perform cascade deletes of all related entities in a transaction to avoid foreign key constraints
        await prisma.$transaction([
            // Nullify Client Notes written by this barber
            prisma.clientNote.updateMany({
                where: { authorId: barberId },
                data: { authorId: null }
            }),
            // Delete Appointments
            prisma.appointment.deleteMany({
                where: { barberId: barberId }
            }),
            // Delete Sales
            prisma.sale.deleteMany({
                where: { barberId: barberId }
            }),
            // Delete Schedules
            prisma.schedule.deleteMany({
                where: { barberId: barberId }
            }),
            // Delete Time Offs
            prisma.timeOff.deleteMany({
                where: { barberId: barberId }
            }),
            // Delete Staff Goals
            prisma.staffGoal.deleteMany({
                where: { barberId: barberId }
            }),
            // Finally, delete the User
            prisma.user.delete({
                where: { id: barberId }
            })
        ])

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Delete staff error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

