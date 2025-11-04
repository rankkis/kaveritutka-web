/**
 * Compares two string arrays for equality
 * @param prev - First array
 * @param curr - Second array
 * @returns true if arrays are equal (same length and elements in same order), false otherwise
 */
export function areEqual(prev: string[], curr: string[]): boolean {
  if (prev.length !== curr.length) {
    return false;
  }
  return prev.every((item, index) => item === curr[index]);
}
