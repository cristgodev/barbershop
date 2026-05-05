import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

function formatICSDate(date: Date) {
    // Convert to UTC and format as YYYYMMDDTHHMMSSZ
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.barbershopId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const barberId = searchParams.get('barberId');
        
        const shopId = session.user.barbershopId;
        const role = session.user.role;

        let whereClause: any = { barbershopId: shopId };

        if (barberId === 'ALL') {
            if (role !== 'OWNER') {
                return new NextResponse('Forbidden', { status: 403 });
            }
        } else if (barberId) {
            // Barber can only export their own calendar unless they are owner
            if (role !== 'OWNER' && session.user.id !== barberId) {
                return new NextResponse('Forbidden', { status: 403 });
            }
            whereClause.barberId = barberId;
        } else {
            whereClause.barberId = session.user.id;
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: {
                service: true,
                customer: true,
                barber: true
            },
            orderBy: { startTime: 'asc' }
        });

        // Also fetch TimeOffs to block out actual unavailable time
        const timeOffs = await prisma.timeOff.findMany({
            where: {
                barberId: barberId === 'ALL' ? undefined : (barberId || undefined),
                barber: { barbershopId: shopId }
            },
            include: { barber: true }
        });

        let icsGroups = appointments.map(apt => {
            const startStr = formatICSDate(new Date(apt.startTime));
            const endStr = formatICSDate(new Date(apt.endTime));
            const dtStamp = formatICSDate(apt.createdAt);
            const summary = `${apt.service.name} - ${apt.customer.name || 'Walk-in'}`;
            const description = `Barbero: ${apt.barber.name}\\nCliente: ${apt.customer.name || 'Walk-in'} (${apt.customer.phone || 'Sin tel'})\\nStatus: ${apt.status}`;
            
            return `BEGIN:VEVENT
UID:${apt.id}@barbershop-saas.com
DTSTAMP:${dtStamp}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${summary}
DESCRIPTION:${description}
END:VEVENT`;
        });

        let timeOffGroups = timeOffs.map(t => {
            // TimeOff is full day usually, but we stored it as DateTime
            const tDate = new Date(t.date);
            const startStr = formatICSDate(new Date(tDate.setUTCHours(7, 0, 0, 0))); // e.g. 7 AM
            const endStr = formatICSDate(new Date(tDate.setUTCHours(22, 0, 0, 0))); // e.g. 10 PM
            const dtStamp = formatICSDate(t.createdAt);
            const summary = `⛔ LIBRE: ${t.barber.name || 'Staff'}`;
            const description = `Motivo: ${t.reason || 'Personal'}`;

            return `BEGIN:VEVENT
UID:timeoff-${t.id}@barbershop-saas.com
DTSTAMP:${dtStamp}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${summary}
DESCRIPTION:${description}
END:VEVENT`;
        });

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SaaS Barbershop//Agenda//ES
CALSCALE:GREGORIAN
${icsGroups.join('\n')}
${timeOffGroups.join('\n')}
END:VCALENDAR`;

        const response = new NextResponse(icsContent);
        response.headers.set('Content-Type', 'text/calendar; charset=utf-8');
        response.headers.set('Content-Disposition', `attachment; filename="agenda_sincronizada.ics"`);

        return response;
    } catch (error) {
        console.error('Calendar Sync Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
