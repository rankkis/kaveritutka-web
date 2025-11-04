import { areEqual } from './string-array.helper';

describe('String Array Helpers', () => {
  describe('areEqual', () => {
    it('should return true for identical arrays', () => {
      const prev = ['Lahti', 'Hollola'];
      const curr = ['Lahti', 'Hollola'];
      expect(areEqual(prev, curr)).toBe(true);
    });

    it('should return true for empty arrays', () => {
      const prev: string[] = [];
      const curr: string[] = [];
      expect(areEqual(prev, curr)).toBe(true);
    });

    it('should return true for single-element arrays with same value', () => {
      const prev = ['Lahti'];
      const curr = ['Lahti'];
      expect(areEqual(prev, curr)).toBe(true);
    });

    it('should return false for arrays with different lengths', () => {
      const prev = ['Lahti'];
      const curr = ['Lahti', 'Hollola'];
      expect(areEqual(prev, curr)).toBe(false);
    });

    it('should return false for arrays with same length but different values', () => {
      const prev = ['Lahti', 'Hollola'];
      const curr = ['Lahti', 'Helsinki'];
      expect(areEqual(prev, curr)).toBe(false);
    });

    it('should return false for arrays with same values in different order', () => {
      const prev = ['Lahti', 'Hollola'];
      const curr = ['Hollola', 'Lahti'];
      expect(areEqual(prev, curr)).toBe(false);
    });

    it('should return false when comparing empty array with non-empty array', () => {
      const prev: string[] = [];
      const curr = ['Lahti'];
      expect(areEqual(prev, curr)).toBe(false);
    });

    it('should return false when comparing non-empty array with empty array', () => {
      const prev = ['Lahti'];
      const curr: string[] = [];
      expect(areEqual(prev, curr)).toBe(false);
    });

    it('should handle arrays with multiple identical elements', () => {
      const prev = ['Lahti', 'Helsinki', 'Tampere'];
      const curr = ['Lahti', 'Helsinki', 'Tampere'];
      expect(areEqual(prev, curr)).toBe(true);
    });

    it('should return false when one element differs in a long array', () => {
      const prev = ['Lahti', 'Helsinki', 'Tampere'];
      const curr = ['Lahti', 'Helsinki', 'Oulu'];
      expect(areEqual(prev, curr)).toBe(false);
    });
  });
});
