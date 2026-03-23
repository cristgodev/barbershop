import { prisma } from "./prisma";

type WebhookEventType = 'APPOINTMENT_BOOKED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_COMPLETED';

/**
 * Sends an asynchronous webhook containing appointment details.
 * This is "fire and forget" to avoid blocking the user flow.
 */
export async function sendAppointmentWebhook(appointmentId: string, eventType: WebhookEventType) {
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.log(`[Webhook] Skipped ${eventType} for ${appointmentId}: No WHATSAPP_WEBHOOK_URL configured.`);
        return;
    }

    try {
        // Fetch full appointment details needed for a notification
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                customer: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                barber: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                service: {
                    select: {
                        name: true,
                        price: true,
                        durationMins: true,
                    }
                },
                barbershop: {
                    select: {
                        name: true,
                        phone: true,
                    }
                }
            }
        });

        if (!appointment) return;

        const payload = {
            event: eventType,
            timestamp: new Date().toISOString(),
            data: {
                appointmentSchema: {
                    id: appointment.id,
                    status: appointment.status,
                    date: appointment.date.toISOString(),
                    startTime: appointment.startTime.toISOString(),
                    endTime: appointment.endTime.toISOString(),
                },
                customer: appointment.customer,
                barber: appointment.barber,
                service: appointment.service,
                barbershop: appointment.barbershop,
            }
        };

        // Fire and forget
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.WHATSAPP_WEBHOOK_SECRET || ''}`
            },
            body: JSON.stringify(payload),
        }).catch(err => {
            console.error(`[Webhook] Failed to send ${eventType} to ${webhookUrl}:`, err.message);
        });

    } catch (error) {
        console.error(`[Webhook] Error preparing ${eventType} payload:`, error);
    }
}
