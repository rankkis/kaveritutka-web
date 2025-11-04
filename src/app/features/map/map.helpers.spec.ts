import { getMarkerClass, isMobileDevice } from './map.helpers';
import { Playtime } from '../../shared/models/playtime.model';

describe('Map Helpers', () => {
  describe('getMarkerClass', () => {
    let now: Date;

    beforeEach(() => {
      // Set a fixed "now" time for consistent testing
      now = new Date('2025-01-15T12:00:00');
    });

    it('should return "standard" when no playtimes exist', () => {
      const playtimes: Playtime[] = [];
      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('standard');
    });

    it('should return "ongoing" when a playtime is currently happening', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T11:30:00'), // Started 30 minutes ago
          duration: 2, // 2 hours duration
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('ongoing');
    });

    it('should return "ongoing" when playtime just started', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T12:00:00'), // Starting now
          duration: 1,
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('ongoing');
    });

    it('should return "ongoing" when playtime is about to end', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T11:00:00'), // Started 1 hour ago
          duration: 1, // Ends exactly now
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('ongoing');
    });

    it('should return "upcoming" when playtime starts within 2 hours', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T13:30:00'), // Starts in 1.5 hours
          duration: 1,
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('upcoming');
    });

    it('should return "upcoming" when playtime starts in exactly 2 hours', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T14:00:00'), // Starts in exactly 2 hours
          duration: 1,
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('upcoming');
    });

    it('should return "standard" when playtime starts in more than 2 hours', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T14:01:00'), // Starts in 2 hours 1 minute
          duration: 1,
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('standard');
    });

    it('should return "standard" when playtime has already ended', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T09:00:00'), // Started 3 hours ago
          duration: 2, // Ended 1 hour ago
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('standard');
    });

    it('should prioritize "ongoing" over "upcoming" when multiple playtimes exist', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T13:00:00'), // Upcoming (in 1 hour)
          duration: 1,
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        },
        {
          id: '2',
          playgroundId: 'pg1',
          parentName: 'Another Parent',
          scheduledTime: new Date('2025-01-15T11:30:00'), // Ongoing (started 30 min ago)
          duration: 1,
          participants: [{ childAge: 4, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('ongoing');
    });

    it('should return "upcoming" when only upcoming playtimes exist (no ongoing)', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T13:00:00'), // Upcoming (in 1 hour)
          duration: 1,
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        },
        {
          id: '2',
          playgroundId: 'pg1',
          parentName: 'Another Parent',
          scheduledTime: new Date('2025-01-15T15:00:00'), // Future (in 3 hours)
          duration: 1,
          participants: [{ childAge: 4, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('upcoming');
    });

    it('should handle playtimes with different durations correctly', () => {
      const playtimes: Playtime[] = [
        {
          id: '1',
          playgroundId: 'pg1',
          parentName: 'Test Parent',
          scheduledTime: new Date('2025-01-15T10:00:00'), // Started 2 hours ago
          duration: 0.5, // 30 minutes, so ended 1.5 hours ago
          participants: [{ childAge: 3, childGender: null, interests: [] }],
          createdAt: new Date()
        }
      ];

      const result = getMarkerClass(playtimes, now);
      expect(result).toBe('standard'); // Should be standard, not ongoing
    });
  });

  describe('isMobileDevice', () => {
    let originalInnerWidth: number;

    beforeEach(() => {
      // Save original window.innerWidth
      originalInnerWidth = window.innerWidth;
    });

    afterEach(() => {
      // Restore original window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth
      });
    });

    it('should return true when window width is 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true when window width is less than 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375 // Common mobile width (iPhone)
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return true when window width is 320px (small mobile)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320
      });

      expect(isMobileDevice()).toBe(true);
    });

    it('should return false when window width is greater than 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024 // Tablet/Desktop
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should return false when window width is 769px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 769
      });

      expect(isMobileDevice()).toBe(false);
    });

    it('should return false for typical desktop width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });

      expect(isMobileDevice()).toBe(false);
    });
  });
});
