import { db } from "./index.js";
import { users, bookings } from "./schema.js";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Clearing existing data...");

  // Clear bookings first (due to foreign key constraint)
  await db.delete(bookings);
  await db.delete(users);

  console.log("Seeding users...");
  const seedUsers = [
    { id: "user_alice", name: "Alice" },
    { id: "user_bob", name: "Bob" },
    { id: "user_charlie", name: "Charlie" },
    { id: "user_dave", name: "Dave" },
  ];

  await db.insert(users).values(seedUsers);

  console.log(`Seeded ${seedUsers.length} users:`);
  seedUsers.forEach((user) => {
    console.log(`  - ${user.id}: ${user.name}`);
  });

  console.log("\nSeed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

