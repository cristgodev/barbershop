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

    // Fetch customer's loyalty balance and shop associations
    const userDb = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { barbershopId: true }
    });

    let targetShopId = userDb?.barbershopId;
    if (!targetShopId && appointments.length > 0) {
        targetShopId = appointments[0].barbershopId;
    }

    // Fetch customer's loyalty balance for this specific barbershop
    const loyaltyRecord = targetShopId 
        ? await prisma.customerLoyalty.findUnique({
            where: {
                userId_barbershopId: {
                    userId: session.user.id,
                    barbershopId: targetShopId
                }
            },
            select: { points: true }
          })
        : null;
    const loyaltyPoints = loyaltyRecord?.points || 0;

    // Fetch the shop slug for direct book link
    const shopObj = targetShopId 
        ? await prisma.barbershop.findUnique({
            where: { id: targetShopId },
            select: { slug: true, name: true }
          })
        : null;
    const shopSlug = shopObj?.slug || "";
    const shopName = shopObj?.name || "";

    const rewards = targetShopId 
        ? await prisma.loyaltyReward.findMany({
            where: { barbershopId: targetShopId },
            orderBy: { pointsCost: 'asc' }
          })
        : [];

    return (
        <ClientDashboardClient 
            userName={session.user.name || "Customer"} 
            upcomingAppointments={serializedUpcoming}
            pastAppointments={serializedPast}
            loyaltyPoints={loyaltyPoints}
            shopSlug={shopSlug}
            shopName={shopName}
            rewards={rewards.map(r => ({
                id: r.id,
                name: r.name,
                pointsCost: r.pointsCost,
                description: r.description
            }))}
        />
    );
}
