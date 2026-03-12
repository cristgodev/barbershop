import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const appointmentId = resolvedParams.id;

    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            service: true,
            barber: true,
            barbershop: true,
            customer: true
        }
    });

    if (!appointment) {
        return new NextResponse('Not found', { status: 404 });
    }

    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(new Date(appointment.startTime));
    const end = formatDate(new Date(appointment.endTime));
    const now = formatDate(new Date());

    const title = `${appointment.service.name} at ${appointment.barbershop.name}`;
    const description = `Booking with ${appointment.barber.name || 'Staff'}\\nCustomer: ${appointment.customer.name || 'Guest'}\\nPrice: $${appointment.service.price}`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Barbershop SaaS//EN',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `DTSTAMP:${now}`,
        `UID:${appointment.id}@barbershop.local`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${appointment.barbershop.address || 'Barbershop'}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return new NextResponse(icsContent, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="appointment-${appointment.id}.ics"`,
        }
    });
}
