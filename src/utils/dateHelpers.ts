/**
 * Date manipulation helpers for installment generation
 */

/**
 * Adds days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adds months to a date, respecting month lengths
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const currentMonth = result.getMonth();
  result.setMonth(currentMonth + months);
  
  // Handle edge case where day doesn't exist in target month (e.g., Jan 31 -> Feb 28/29)
  if (result.getMonth() !== (currentMonth + months) % 12) {
    result.setDate(0); // Set to last day of previous month
  }
  
  return result;
}

/**
 * Calculates the next due date based on frequency
 */
export function calculateNextDueDate(startDate: Date, frequency: string, installmentNumber: number): Date {
  switch (frequency) {
    case 'WEEKLY':
      return addDays(startDate, 7 * installmentNumber);
    case 'BIWEEKLY':
      return addDays(startDate, 14 * installmentNumber);
    case 'MONTHLY':
      return addMonths(startDate, installmentNumber);
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
}

/**
 * Rounds a number to 2 decimal places
 */
export function roundToTwoDecimals(value: number | string): number {
  return Math.round(Number(value) * 100) / 100;
}

