import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsFolder = join(__dirname, "../../drizzle");

const connectionString = process.env.DATABASE_URL;

// Configure postgres client with SSL for Supabase compatibility
// Supabase requires SSL connections
let sql: ReturnType<typeof postgres>;
try {
  sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    ssl: connectionString.includes("supabase") || connectionString.includes("neon")
      ? "require"
      : undefined,
  });
} catch (error: any) {
  console.error("Failed to parse DATABASE_URL. Common issues:");
  console.error("1. Ensure special characters in password are URL-encoded");
  console.error("2. For Supabase, use the connection string from: Project Settings > Database");
  console.error("3. Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres");
  throw error;
}

const db = drizzle(sql, { schema });

async function runMigrations() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder });
  console.log("Migrations completed!");
  await sql.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

