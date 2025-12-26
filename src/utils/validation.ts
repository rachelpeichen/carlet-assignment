type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Checks if a year is a leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Gets the number of days in a month, accounting for leap years
 */
function getDaysInMonth(year: number, month: Month): number {
  const daysInMonth: {
    [key in Month]: number;
  } = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  };
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month];
}

/**
 * Validates if a date string is in YYYY-MM-DD format and represents a valid date
 * Properly checks for leap years and valid days in each month
 */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const parts = dateString.split("-");
  if(!validDateString(parts)) {
    return false;
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) as Month;
  const day = parseInt(parts[2], 10);

  // Validate year is reasonable (not too far in past/future)
  if (year < 1900 || year > 2100) {
    return false;
  }

  // Validate month is 1-12
  if (month < 1 || month > 12) {
    return false;
  }

  // Validate day is valid for the given month and year
  const daysInMonth = getDaysInMonth(year, month);
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  return true;
}

function validDateString(dateString: string[]): dateString is [string, string, string] {
    return dateString.length === 3 && dateString.every(part => typeof part === 'string' && part.length > 0);
}

/**
 * Validates if a time string is in HH:mm format and within business hours
 * Business hours: 09:00 to 16:00 (inclusive)
 */
export function isValidTimeSlot(timeString: string): boolean {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!regex.test(timeString)) {
    return false;
  }

  const [hours, minutes] = timeString.split(":").map(Number);

  // Must be exactly on the hour (minutes = 0)
  if (minutes !== 0) {
    return false;
  }

  // Must be between 09:00 and 16:00 (inclusive)
  return hours !== undefined && hours >= 9 && hours <= 16;
}

/**
 * Generates all available time slots for a given date
 * Returns slots from 09:00 to 16:00 (1-hour slots)
 */
export function generateAllSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 9; hour <= 16; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

