import { PLAYTIME_PERIOD } from '../constants';

/**
 * Generate time slots for playground visits
 * @param startHour - Starting hour (default: PLAYTIME_PERIOD.START_HOUR)
 * @param endHour - Ending hour (default: PLAYTIME_PERIOD.END_HOUR)
 * @param intervalMinutes - Interval between slots in minutes (default: PLAYTIME_PERIOD.INTERVAL_MINUTES)
 * @returns Array of time strings in HH:mm format
 */
export function generateTimeSlots(
  startHour: number = PLAYTIME_PERIOD.START_HOUR,
  endHour: number = PLAYTIME_PERIOD.END_HOUR,
  intervalMinutes: number = PLAYTIME_PERIOD.INTERVAL_MINUTES
): string[] {
  const slots: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break; // Don't go past end hour
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }

  return slots;
}
