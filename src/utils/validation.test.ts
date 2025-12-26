import { describe, test, expect } from "bun:test";
import { isValidDate, isValidTimeSlot, generateAllSlots } from "./validation.js";

describe("isValidDate", () => {
  describe("valid dates", () => {
    test("should accept valid dates in YYYY-MM-DD format", () => {
      expect(isValidDate("2024-01-15")).toBe(true);
      expect(isValidDate("2024-12-31")).toBe(true);
      expect(isValidDate("2024-01-01")).toBe(true);
    });

    test("should accept February 29 in leap years", () => {
      expect(isValidDate("2024-02-29")).toBe(true);
      expect(isValidDate("2000-02-29")).toBe(true);
      expect(isValidDate("2020-02-29")).toBe(true);
    });

    test("should accept all valid days in each month", () => {
      expect(isValidDate("2024-01-31")).toBe(true);
      expect(isValidDate("2024-02-28")).toBe(true);
      expect(isValidDate("2023-02-28")).toBe(true);
      expect(isValidDate("2024-03-31")).toBe(true);
      expect(isValidDate("2024-04-30")).toBe(true);
      expect(isValidDate("2024-05-31")).toBe(true);
      expect(isValidDate("2024-06-30")).toBe(true);
      expect(isValidDate("2024-07-31")).toBe(true);
      expect(isValidDate("2024-08-31")).toBe(true);
      expect(isValidDate("2024-09-30")).toBe(true);
      expect(isValidDate("2024-10-31")).toBe(true);
      expect(isValidDate("2024-11-30")).toBe(true);
      expect(isValidDate("2024-12-31")).toBe(true);
    });
  });

  describe("invalid dates", () => {
    test("should reject invalid format", () => {
      expect(isValidDate("2024/01/15")).toBe(false); // Wrong separator
      expect(isValidDate("01-15-2024")).toBe(false); // Wrong order
      expect(isValidDate("2024-1-15")).toBe(false); // Single digit month
      expect(isValidDate("2024-01-5")).toBe(false); // Single digit day
      expect(isValidDate("24-01-15")).toBe(false); // Two digit year
      expect(isValidDate("2024-01-15-20")).toBe(false); // Extra parts
      expect(isValidDate("")).toBe(false); // Empty string
      expect(isValidDate("invalid")).toBe(false); // Not a date
    });

    test("should reject invalid months", () => {
      expect(isValidDate("2024-00-15")).toBe(false);
      expect(isValidDate("2024-13-15")).toBe(false);
      expect(isValidDate("2024-20-15")).toBe(false);
    });

    test("should reject invalid days", () => {
      expect(isValidDate("2024-01-00")).toBe(false);
      expect(isValidDate("2024-01-32")).toBe(false);
      expect(isValidDate("2024-04-31")).toBe(false);
    });

    test("should reject February 29 in non-leap years", () => {
      expect(isValidDate("2023-02-29")).toBe(false); // 2023 is not a leap year
      expect(isValidDate("2025-02-29")).toBe(false); // 2025 is not a leap year
    });

    test("should reject February 30 (never valid)", () => {
      expect(isValidDate("2024-02-30")).toBe(false); // leap year
      expect(isValidDate("2023-02-30")).toBe(false); // Non-leap year
    });

    test("should reject February 31 (never valid)", () => {
        expect(isValidDate("2024-02-31")).toBe(false);
        expect(isValidDate("2023-02-31")).toBe(false);
    });
  });
});

describe("isValidTimeSlot", () => {
  describe("valid time slots", () => {
    test("should accept all valid business hours", () => {
      expect(isValidTimeSlot("09:00")).toBe(true);
      expect(isValidTimeSlot("10:00")).toBe(true);
      expect(isValidTimeSlot("11:00")).toBe(true);
      expect(isValidTimeSlot("12:00")).toBe(true);
      expect(isValidTimeSlot("13:00")).toBe(true);
      expect(isValidTimeSlot("14:00")).toBe(true);
      expect(isValidTimeSlot("15:00")).toBe(true);
      expect(isValidTimeSlot("16:00")).toBe(true);
    });

    test("should accept boundary times", () => {
      expect(isValidTimeSlot("09:00")).toBe(true);
      expect(isValidTimeSlot("16:00")).toBe(true);
    });
  });

  describe("invalid time slots", () => {
    test("should reject times outside business hours", () => {
      expect(isValidTimeSlot("08:00")).toBe(false);
      expect(isValidTimeSlot("17:00")).toBe(false);
      expect(isValidTimeSlot("00:00")).toBe(false);
      expect(isValidTimeSlot("23:00")).toBe(false);
    });

    test("should reject times not on the hour", () => {
      expect(isValidTimeSlot("09:30")).toBe(false);
      expect(isValidTimeSlot("10:15")).toBe(false);
      expect(isValidTimeSlot("12:45")).toBe(false);
      expect(isValidTimeSlot("14:01")).toBe(false);
      expect(isValidTimeSlot("15:59")).toBe(false);
    });

    test("should reject invalid format", () => {
      expect(isValidTimeSlot("9:00")).toBe(false); // Single digit hour
      expect(isValidTimeSlot("09:0")).toBe(false); // Single digit minute
      expect(isValidTimeSlot("9:0")).toBe(false); // Both single digit
      expect(isValidTimeSlot("09:00:00")).toBe(false); // Includes seconds
      expect(isValidTimeSlot("")).toBe(false); // Empty string
      expect(isValidTimeSlot("invalid")).toBe(false); // Not a time
      expect(isValidTimeSlot("25:00")).toBe(false); // Invalid hour
      expect(isValidTimeSlot("09:60")).toBe(false); // Invalid minute
    });

    test("should reject times with wrong separators", () => {
      expect(isValidTimeSlot("09-00")).toBe(false);
      expect(isValidTimeSlot("09.00")).toBe(false);
      expect(isValidTimeSlot("09 00")).toBe(false);
    });
  });
});

describe("generateAllSlots", () => {
  test("should generate all 8 slots from 09:00 to 16:00", () => {
    const slots = generateAllSlots();
    expect(slots).toEqual([
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ]);
  });

  test("should generate exactly 8 slots", () => {
    const slots = generateAllSlots();
    expect(slots.length).toBe(8);
  });

  test("should generate slots in correct order", () => {
    const slots = generateAllSlots();
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("16:00");
  });

  test("should generate slots with proper formatting (HH:mm)", () => {
    const slots = generateAllSlots();
    slots.forEach((slot) => {
      expect(slot).toMatch(/^\d{2}:\d{2}$/);
      expect(slot.split(":")[1]).toBe("00"); // All minutes should be 00
    });
  });
});
