/**
 * Date utility functions for consistent UTC date handling across the backend.
 * 
 * IMPORTANT: All analytics dates MUST be normalized to UTC to ensure consistency
 * between frontend and backend. Using local timezone causes mismatches.
 */

/**
 * Normalizes a date to UTC start-of-day (00:00:00.000Z) or end-of-day (23:59:59.999Z)
 * 
 * @param date - The date to normalize
 * @param endOfDay - If true, returns end of day (23:59:59.999Z), otherwise start (00:00:00.000Z)
 * @returns Date object in UTC
 * 
 * @example
 * // Nov 4, 2025 (any time, any timezone)
 * normalizeToUTC(new Date('2025-11-04'), false)
 * // Returns: 2025-11-04T00:00:00.000Z
 * 
 * normalizeToUTC(new Date('2025-11-04'), true)
 * // Returns: 2025-11-04T23:59:59.999Z
 */
export const normalizeToUTC = (date: Date, endOfDay: boolean = false): Date => {
  // Convert to ISO date string (YYYY-MM-DD) to get the date portion
  const dateString = date.toISOString().split("T")[0];
  
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


