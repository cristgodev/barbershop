import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import SuperAdminClient from "./SuperAdminClient";

export const metadata = {
    title: "Super Admin | SaaS Control",
};

export default async function SuperAdminPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    if (session.user.role !== "SUPERADMIN") {
        redirect("/"); // Bloquear acceso si no es superadmin
    }

    const shops = await prisma.barbershop.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { appointments: true, staff: true }
            }
        }
    });

    return (
        <SuperAdminClient shops={shops} />
    );
}
