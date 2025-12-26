import { Hono } from "hono";
import { getAvailableSlots } from "./routes/slots.js";
import { createBooking } from "./routes/bookings.js";

const app = new Hono();

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Get available slots for a date
app.get("/slots", getAvailableSlots);

// Book an appointment
app.post("/bookings", createBooking);

// Start server
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};

