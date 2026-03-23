import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import { prisma } from '../../lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['OWNER', 'MANAGER', 'ADMIN', 'BARBER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const barbershopId = session.user.barbershopId
        if (!barbershopId) {
            return NextResponse.json({ error: 'No barbershop associated with user' }, { status: 400 })
        }

        const appointments = await prisma.appointment.findMany({
            where: { barbershopId },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        image: true,
                        createdAt: true
                    }
                },
                service: {
                    select: {
                        price: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        const clientsMap = new Map();
        
        appointments.forEach(app => {
            const customer = app.customer;
            if (!customer) return;

            if (!clientsMap.has(customer.id)) {
                clientsMap.set(customer.id, {
                    ...customer,
                    totalAppointments: 0,
                    lastVisit: app.date,
                    totalSpent: 0,
                    status: app.status // Just to have at least one status
                });
            }
            
            const clientData = clientsMap.get(customer.id);
            clientData.totalAppointments += 1;
            
            if (app.status === 'COMPLETED') {
                 clientData.totalSpent += (app.service?.price || 0);
            }
            
            if (new Date(app.date) > new Date(clientData.lastVisit)) {
                clientData.lastVisit = app.date;
            }
        });

        const uniqueClients = Array.from(clientsMap.values());

        return NextResponse.json({ success: true, clients: uniqueClients })

    } catch (error: any) {
        console.error('Error fetching clients:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
