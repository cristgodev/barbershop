import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ClientDashboardClient from "./ClientDashboardClient";

export const metadata = {
    title: "My Appointments | Barbershop",
    description: "View and manage your barbershop appointments.",
};

export default async function ClientDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/client/login");
    }

    // Both CUSTOMER and STAFF can view their appointments they made as customers
    const appointments = await prisma.appointment.findMany({
        where: {
            customerId: session.user.id,
        },
        include: {
            barber: {
                select: {
                    name: true,
                    avatarUrl: true,
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
                    slug: true,
                    phone: true,
                    address: true,
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    const now = new Date();
    
    // Separate into upcoming and past
    const upcoming = appointments.filter(apt => {
        // Create a comparable datetime combining date and time
        const aptDateTime = new Date(apt.startTime);
        return aptDateTime > now && apt.status !== 'CANCELLED';
    }).reverse(); // Reverse so the soonest is first

    const past = appointments.filter(apt => {
        const aptDateTime = new Date(apt.startTime);
        return aptDateTime <= now || apt.status === 'CANCELLED';
    });

    // We serialize dates for the client component
    const serializedUpcoming = upcoming.map(apt => ({
        ...apt,
        date: apt.date.toISOString(),
        startTime: apt.startTime.toISOString(),
        endTime: apt.endTime.toISOString(),
        createdAt: apt.createdAt.toISOString(),
        updatedAt: apt.updatedAt.toISOString()
    }));

    const serializedPast = past.map(apt => ({
        ...apt,
        date: apt.date.toISOString(),
        startTime: apt.startTime.toISOString(),
        endTime: apt.endTime.toISOString(),
        createdAt: apt.createdAt.toISOString(),
        updatedAt: apt.updatedAt.toISOString()
    }));

    return (
        <ClientDashboardClient 
            userName={session.user.name || "Customer"} 
            upcomingAppointments={serializedUpcoming}
            pastAppointments={serializedPast}
        />
    );
}
