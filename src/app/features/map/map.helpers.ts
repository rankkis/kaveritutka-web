import { Playtime } from '../../shared/models/playtime.model';

/**
 * Determines the marker class based on playtime status
 * @param playtimes - Array of playtimes for a playground
 * @param now - Current date/time
 * @returns Marker class: 'ongoing', 'upcoming', or 'standard'
 */
export function getMarkerClass(playtimes: Playtime[], now: Date): string {
  if (playtimes.length === 0) {
    return 'standard';
  }

  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Check for ongoing events
  for (const playtime of playtimes) {
    const startTime = new Date(playtime.scheduledTime);
    const endTime = new Date(startTime.getTime() + playtime.duration * 60 * 60 * 1000);

    if (now >= startTime && now <= endTime) {
      return 'ongoing';
    }
  }

  // Check for upcoming events (within 2 hours)
  for (const playtime of playtimes) {
    const startTime = new Date(playtime.scheduledTime);

    if (startTime > now && startTime <= twoHoursFromNow) {
      return 'upcoming';
    }
  }

  return 'standard';
}

/**
 * Checks if the device is mobile based on window width
 * @returns true if mobile (width <= 768px)
 */
export function isMobileDevice(): boolean {
  return window.innerWidth <= 768;
}
