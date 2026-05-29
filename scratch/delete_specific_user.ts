import { PrismaClient } from '../app/generated/prisma';

// Use the robust session-mode pooler on port 5432
const directUrl = "postgresql://postgres.ifxqbfumzudzoqvzubif:C19052006L0601@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
});

async function main() {
  const email = "oropezaluisalfredo1@gmail.com";

  try {
    console.log(`Searching for user with email: ${email}...`);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found in the database.`);
      return;
    }

    const userId = user.id;
    console.log(`✅ Found user. ID: ${userId}, Name: ${user.name}, Role: ${user.role}`);

    console.log("Starting sequential deletion sequence to bypass transaction timeout limits...");

    // 1. Delete Appointments where user is customer or barber
    const deletedAppointments = await prisma.appointment.deleteMany({
      where: {
        OR: [
          { customerId: userId },
          { barberId: userId }
        ]
      }
    });
    console.log(`- Deleted ${deletedAppointments.count} associated appointments.`);

    // 2. Set authorId = null on ClientNotes where user is author
    const updatedNotes = await prisma.clientNote.updateMany({
      where: { authorId: userId },
      data: { authorId: null }
    });
    console.log(`- Updated ${updatedNotes.count} client notes written by the user.`);

    // 3. Delete ClientNotes where user is customer
    const deletedNotes = await prisma.clientNote.deleteMany({
      where: { customerId: userId }
    });
    console.log(`- Deleted ${deletedNotes.count} client notes about the user.`);

    // 4. Delete Sales made by or purchased by the user
    const deletedSales = await prisma.sale.deleteMany({
      where: {
        OR: [
          { customerId: userId },
          { barberId: userId }
        ]
      }
    });
    console.log(`- Deleted ${deletedSales.count} sales.`);

    // 5. Delete CustomerLoyalty points
    const deletedLoyalty = await prisma.customerLoyalty.deleteMany({
      where: { userId }
    });
    console.log(`- Deleted ${deletedLoyalty.count} loyalty balance entries.`);

    // 6. Delete Schedules
    const deletedSchedules = await prisma.schedule.deleteMany({
      where: { barberId: userId }
    });
    console.log(`- Deleted ${deletedSchedules.count} work schedules.`);

    // 7. Delete Staff Goals
    const deletedGoals = await prisma.staffGoal.deleteMany({
      where: { barberId: userId }
    });
    console.log(`- Deleted ${deletedGoals.count} staff goals.`);

    // 8. Delete Time Offs
    const deletedTimeOffs = await prisma.timeOff.deleteMany({
      where: { barberId: userId }
    });
    console.log(`- Deleted ${deletedTimeOffs.count} time-off entries.`);

    // 9. Delete Accounts
    const deletedAccounts = await prisma.account.deleteMany({
      where: { userId }
    });
    console.log(`- Deleted ${deletedAccounts.count} social login accounts.`);

    // 10. Finally, delete the User record
    await prisma.user.delete({
      where: { id: userId }
    });
    console.log(`🎉 User ${email} deleted successfully!`);

  } catch (error: any) {
    console.error("❌ Deletion failed, user was not deleted:", error);
  }
}

main().finally(() => prisma.$disconnect());
