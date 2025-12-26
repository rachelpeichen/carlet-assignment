import { Context } from "hono";
import { db } from "../db/index.js";
import { bookings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { isValidDate, generateAllSlots } from "../utils/validation.js";

export async function getAvailableSlots(c: Context) {
  const date = c.req.query("date");

  if (!date) {
    return c.json({ error: "Invalid date format" }, 400);
  }

  if (!isValidDate(date)) {
    return c.json({ error: "Invalid date format" }, 400);
  }

  // Get all booked slots for this date
  const bookedSlots = await db
    .select({ time: bookings.time })
    .from(bookings)
    .where(eq(bookings.date, date));

  const bookedTimes = new Set(bookedSlots.map((slot) => slot.time));

  // Generate all possible slots (09:00 to 16:00)
  const allSlots = generateAllSlots();

  // Filter out booked slots
  const availableTimes = allSlots.filter((time) => !bookedTimes.has(time));

  return c.json({ available_times: availableTimes });
}

