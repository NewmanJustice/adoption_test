/**
 * Format a date to ISO 8601 string
 * @param date - Date to format (defaults to current date)
 * @returns ISO 8601 formatted date string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Format a date to UK locale string
 * @param date - Date to format
 * @returns UK formatted date string (e.g., "3 February 2026")
 */
export function formatDateUK(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
