/**
 * Date utility functions for consistent UTC date handling across the application.
 * 
 * IMPORTANT: All analytics dates MUST be normalized to UTC to ensure consistency
 * between frontend and backend. Using local timezone causes mismatches.
 */

/**
 * Normalizes a date to UTC start-of-day (00:00:00.000Z) or end-of-day (23:59:59.999Z)
 * 
 * IMPORTANT: Uses LOCAL date components to prevent timezone shift issues.
 * For example, if user selects Nov 2 in their timezone, this preserves Nov 2 in UTC.
 * 
 * @param date - The date to normalize (in user's local timezone)
 * @param endOfDay - If true, returns end of day (23:59:59.999Z), otherwise start (00:00:00.000Z)
 * @returns Date object in UTC representing the same calendar date
 * 
 * @example
 * // Nov 2, 2025 10:30 AM IST (user's timezone)
 * normalizeToUTC(new Date('2025-11-02T10:30:00'), false)
 * // Returns: 2025-11-02T00:00:00.000Z (NOT Nov 1!)
 * 
 * normalizeToUTC(new Date('2025-11-02T10:30:00'), true)
 * // Returns: 2025-11-02T23:59:59.999Z
 */
export const normalizeToUTC = (date: Date, endOfDay: boolean = false): Date => {
  // Extract LOCAL date components (year, month, day) to prevent timezone shift
  // This ensures Nov 2 in user's timezone becomes Nov 2 in UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;
  
  // Create new Date in UTC by explicitly appending UTC time string
  if (endOfDay) {
    return new Date(dateString + "T23:59:59.999Z");
  } else {
    return new Date(dateString + "T00:00:00.000Z");
  }
};

/**
 * Normalizes a date to UTC start-of-day (00:00:00.000Z)
 * Convenience function for common use case
 * 
 * @param date - The date to normalize
 * @returns Date object at UTC midnight
 */
export const getUTCStartOfDay = (date: Date): Date => {
  return normalizeToUTC(date, false);
};

/**
 * Normalizes a date to UTC end-of-day (23:59:59.999Z)
 * Convenience function for common use case
 * 
 * @param date - The date to normalize
 * @returns Date object at UTC end of day
 */
export const getUTCEndOfDay = (date: Date): Date => {
  return normalizeToUTC(date, true);
};

/**
 * Creates a date range with UTC-normalized start and end dates
 * 
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Object with normalized start and end dates
 */
export const createUTCDateRange = (startDate: Date, endDate: Date) => {
  return {
    start: getUTCStartOfDay(startDate),
    end: getUTCEndOfDay(endDate),
  };
};

/**
 * Checks if two dates are the same day (ignoring time)
 * Uses local date components to avoid timezone issues
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if both dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

