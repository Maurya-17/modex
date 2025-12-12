import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create sample user
  const user = await prisma.user.upsert({
    where: { id: "test-user-1" },
    update: {},
    create: {
      id: "test-user-1",
      name: "John Doe",
      role: "USER",
    },
  });

  // Create sample shows
  const show1 = await prisma.show.create({
    data: {
      title: "The Magic Show",
      startTime: new Date(Date.now() + 3600 * 1000), // 1 hour from now
      totalSeats: 20,
    },
  });

  const show2 = await prisma.show.create({
    data: {
      title: "Comedy Night",
      startTime: new Date(Date.now() + 7200 * 1000), // 2 hours from now
      totalSeats: 15,
    },
  });

  // Create seats for both shows
  const seats = [];

  for (let i = 1; i <= show1.totalSeats; i++) {
    seats.push({
      showId: show1.id,
      seatNumber: i,
    });
  }

  for (let i = 1; i <= show2.totalSeats; i++) {
    seats.push({
      showId: show2.id,
      seatNumber: i,
    });
  }

  await prisma.seat.createMany({
    data: seats,
  });

  console.log("🎭 Shows and seats created!");
  console.log("👤 User created!");
  console.log("✅ Seeding completed.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


