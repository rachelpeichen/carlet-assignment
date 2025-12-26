import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create the connection
const connectionString = process.env.DATABASE_URL;

// Configure postgres client with SSL for Supabase compatibility
const client = postgres(connectionString, {
  ssl: connectionString?.includes("supabase") ? "require" : undefined,
});

// Create the database instance
export const db = drizzle(client, { schema });

