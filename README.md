# Appointment Booking Microservice

A RESTful microservice built with **Bun**, **Hono**, **PostgreSQL**, and **Drizzle ORM** that handles appointment booking with race condition protection.

## Architecture

This microservice implements a booking system for a service bay with a capacity of 1. The key architectural decisions:

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Hono](https://hono.dev/)
- **Database**: PostgreSQL
- **ORM/Query Builder**: [Drizzle ORM](https://orm.drizzle.team/)

### Race Condition Protection

The service handles concurrent booking attempts through a **unique database constraint** on the `(date, time)` combination in the `bookings` table. When two users attempt to book the same slot simultaneously:

1. Both requests validate the slot is available (by querying existing bookings)
2. Both attempt to insert a booking record
3. The database enforces the unique constraint atomically
4. One insert succeeds, the other fails with a constraint violation
5. The failed request returns `{"error": "Slot full"}`

This approach is more reliable than application-level locking because:
- It's atomic at the database level
- No risk of deadlocks or race conditions in application code
- Works correctly even under high concurrency

## Setup

### Prerequisites

- **Bun** v1.3.5 or later ([Install Bun](https://bun.sh))
- **PostgreSQL** database (local or managed service like Neon/Supabase)

### Step 1: Install Dependencies

```bash
bun install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Database connection string
# Example for Neon: postgresql://user:password@host.neon.tech/dbname?sslmode=require
# Example for Supabase: postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
DATABASE_URL=postgresql://user:password@localhost:5432/appointments

# Server port (optional, defaults to 3000)
PORT=3000
```

Replace the `DATABASE_URL` with your actual PostgreSQL connection string. Please refer to `.env.example` file.

### Step 3: Run Database Migrations

This creates the `users` and `bookings` tables:

```bash
bun run migrate
```

### Step 4: Seed the Database

This clears existing data and creates 4 test users (Alice, Bob, Charlie, Dave):

```bash
bun run seed
```

### Step 5: Start the Server

```bash
bun run dev
```

The server will start on `http://localhost:3000` (or the port specified in `PORT`).

## API Endpoints

### 1. Health Check

**GET** `/health`

Returns the service status.

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

### 2. Get Available Slots

**GET** `/slots?date=2024-01-20`

Returns available time slots for a given date.

**Query Parameters:**
- `date` (required): Date in `YYYY-MM-DD` format

**Response** (200 OK):
```json
{
  "available_times": [
    "09:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00"
  ]
}
```

**Response** (400 Bad Request):
```json
{
  "error": "Invalid date format"
}
```

**Business Rules:**
- Slots are 1 hour long
- Available slots: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00
- The shop closes at 17:00, so no slot starting at 17:00

### 3. Book Appointment

**POST** `/bookings`

Creates a new appointment booking.

**Request Body:**
```json
{
  "user_id": "user_alice",
  "date": "2024-01-20",
  "time": "10:00"
}
```

**Response** (200 OK - Success):
```json
{
  "booking_id": "booking_abc123"
}
```

**Response** (400 Bad Request - Failure):

Slot already taken:
```json
{
  "error": "Slot full"
}
```

Time outside business hours:
```json
{
  "error": "Shop closed"
}
```

User not found:
```json
{
  "error": "User not found"
}
```

**Business Rules:**
- Only one booking per `(date, time)` combination (capacity = 1)
- Time must be between 09:00 and 16:00 (inclusive)
- Time must be exactly on the hour (e.g., "10:00", not "10:30")
- User must exist in the database

## Testing

### Unit Tests

Run unit tests for business logic:

```bash
bun test
```

The test suite covers:
- **Date validation**: Valid dates, leap years, invalid dates, edge cases
- **Time slot validation**: Business hours, format validation, boundary conditions
- **Slot generation**: Correct slot list generation

### Manual Testing with cURL

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Get Available Slots:**
```bash
curl "http://localhost:3000/slots?date=2024-01-20"
```

**Book an Appointment:**
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_alice",
    "date": "2024-01-20",
    "time": "10:00"
  }'
```

**Test Race Condition:**
Run two booking requests simultaneously for the same slot:
```bash
# Terminal 1
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_alice", "date": "2024-01-20", "time": "10:00"}'

# Terminal 2 (run immediately after)
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_bob", "date": "2024-01-20", "time": "10:00"}'
```

One should succeed with a `booking_id`, the other should return `{"error": "Slot full"}`.


## Development

### Available Scripts

- `bun run dev` - Start the development server
- `bun run migrate` - Run database migrations
- `bun run seed` - Seed the database with test users
- `bun test` - Run unit tests
- `bun test:watch` - Run unit tests in watch mode

### Generating New Migrations

If you modify the schema, generate a new migration:

```bash
bunx drizzle-kit generate
```

Then run the migration:

```bash
bun run migrate
```
