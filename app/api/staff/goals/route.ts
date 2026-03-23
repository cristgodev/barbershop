import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) {
            return NextResponse.json({ error: 'No barbershop associated' }, { status: 400 })
        }

        const url = new URL(req.url)
        const monthStr = url.searchParams.get('month')
        const yearStr = url.searchParams.get('year')

        if (!monthStr || !yearStr) {
            return NextResponse.json({ error: 'Month and year are required' }, { status: 400 })
        }

        const month = parseInt(monthStr, 10)
        const year = parseInt(yearStr, 10)

        const goals = await prisma.staffGoal.findMany({
            where: {
                barbershopId,
                month,
                year
            }
        })

        return NextResponse.json({ success: true, goals })

    } catch (error: any) {
        console.error('Error fetching staff goals:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) {
            return NextResponse.json({ error: 'No barbershop associated' }, { status: 400 })
        }

        const body = await req.json()
        const { barberId, month, year, targetAmount } = body

        if (!barberId || !month || !year || targetAmount === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const goal = await prisma.staffGoal.upsert({
            where: {
                barberId_month_year: {
                    barberId,
                    month: parseInt(month, 10),
                    year: parseInt(year, 10)
                }
            },
            update: {
                targetAmount: parseFloat(targetAmount)
            },
            create: {
                barbershopId,
                barberId,
                month: parseInt(month, 10),
                year: parseInt(year, 10),
                targetAmount: parseFloat(targetAmount)
            }
        })

        return NextResponse.json({ success: true, goal })

    } catch (error: any) {
        console.error('Error setting staff goal:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
