import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { isActive } = body;
        const resolvedParams = await params;

        if (typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const shop = await prisma.barbershop.update({
            where: { id: resolvedParams.id },
            data: { isActive },
        });

        return NextResponse.json({ success: true, shop });
    } catch (error) {
        console.error("Error updating shop status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const shopId = resolvedParams.id;

        // Check if shop exists first. If it's already deleted (e.g. from a duplicate request), return success early
        const shopExists = await prisma.barbershop.findUnique({
            where: { id: shopId }
        });
        if (!shopExists) {
            return NextResponse.json({ success: true, message: "Shop already deleted" });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete Appointments
            await tx.appointment.deleteMany({ where: { barbershopId: shopId } });

            // 2. Delete CustomerLoyalty
            await tx.customerLoyalty.deleteMany({ where: { barbershopId: shopId } });

            // 3. Delete Campaign
            await tx.campaign.deleteMany({ where: { barbershopId: shopId } });

            // 4. Delete LoyaltyReward
            await tx.loyaltyReward.deleteMany({ where: { barbershopId: shopId } });

            // 5. Delete ClientNote
            await tx.clientNote.deleteMany({ where: { barbershopId: shopId } });

            // 6. Delete ShopTimeOff
            await tx.shopTimeOff.deleteMany({ where: { barbershopId: shopId } });

            // 7. Delete StaffGoal
            await tx.staffGoal.deleteMany({ where: { barbershopId: shopId } });

            // 8. Delete SaleItems (which are connected to Sale)
            await tx.saleItem.deleteMany({
                where: {
                    sale: { barbershopId: shopId }
                }
            });

            // 9. Delete Sales
            await tx.sale.deleteMany({ where: { barbershopId: shopId } });

            // 10. Delete Products
            await tx.product.deleteMany({ where: { barbershopId: shopId } });

            // 11. Delete Services
            await tx.service.deleteMany({ where: { barbershopId: shopId } });

            // 12. Unlink staff users (set barbershopId to null)
            await tx.user.updateMany({
                where: { barbershopId: shopId },
                data: { barbershopId: null }
            });

            // 13. Finally, delete the Barbershop using deleteMany for idempotency
            await tx.barbershop.deleteMany({
                where: { id: shopId }
            });
        });

        return NextResponse.json({ success: true, message: "Shop deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting shop:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
