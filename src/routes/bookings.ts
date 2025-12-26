import type { Context } from "hono";
import { db } from "../db/index.js";
import { bookings, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { isValidDate, isValidTimeSlot } from "../utils/validation.js";

interface BookingRequest {
  user_id: string;
  date: string;
  time: string;
}

export async function createBooking(c: Context) {
  try {
    const body = await c.req.json<BookingRequest>();
    const { user_id, date, time } = body;

    // Validate date format
    if (!isValidDate(date)) {
      return c.json({ error: "Invalid date format" }, 400);
    }

    // Check if user exists first (before time validation)
    // This ensures "User not found" takes precedence over other errors
    if (!user_id) {
      return c.json({ error: "User not found" }, 400);
    }

    const user = await db.select().from(users).where(eq(users.id, user_id)).limit(1);
    if (user.length === 0) {
      return c.json({ error: "User not found" }, 400);
    }

    // Validate time slot (must be 09:00-16:00 and on the hour)
    if (!isValidTimeSlot(time)) {
      return c.json({ error: "Shop closed" }, 400);
    }

    // Attempt to insert the booking
    // The unique constraint on (date, time) will prevent double booking
    // This is atomic at the database level, handling race conditions
    try {
      const result = await db
        .insert(bookings)
        .values({
          userId: user_id,
          date,
          time,
        })
        .returning({ id: bookings.id });

      const booking = result[0];
      if (!booking) {
        throw new Error("Failed to create booking");
      }

      return c.json({ booking_id: booking.id });
    } catch (error: any) {
      // Check if it's a unique constraint violation (slot already taken)
      if (error.code === "23505" || error.message?.includes("unique_slot")) {
        return c.json({ error: "Slot full" }, 400);
      }

      // Check if it's a foreign key constraint violation (user not found)
      if (error.code === "23503" || error.message?.includes("foreign key")) {
        return c.json({ error: "User not found" }, 400);
      }

      // Re-throw other errors
      throw error;
    }
  } catch (error: any) {
    // Handle JSON parsing errors
    if (error instanceof SyntaxError || error.message?.includes("JSON")) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    // Re-throw unexpected errors
    throw error;
  }
}

