import { describe, it, expect } from 'vitest';
import {
  createProgramSchema,
  SLUG_REGEX,
  RESERVED_PROGRAM_SLUGS,
  sessionSchema,
} from '../programs';

describe('Program Validation', () => {
  describe('SLUG_REGEX', () => {
    it('should accept valid slugs', () => {
      expect(SLUG_REGEX.test('isha-kriya-feb-2026')).toBe(true);
      expect(SLUG_REGEX.test('weekend-intensive')).toBe(true);
      expect(SLUG_REGEX.test('yoga-101')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(SLUG_REGEX.test('Invalid Slug')).toBe(false);
      expect(SLUG_REGEX.test('slug_with_underscore')).toBe(false);
      expect(SLUG_REGEX.test('slug-')).toBe(false);
      expect(SLUG_REGEX.test('-slug')).toBe(false);
    });
  });

  describe('sessionSchema', () => {
    it('should validate correct session data', () => {
      const validSession = {
        date: '2026-02-14',
        startTime: '09:00',
        endTime: '17:00',
        title: 'Day 1',
      };
      const result = sessionSchema.safeParse(validSession);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidSession = {
        date: '02/14/2026',
        startTime: '09:00',
        endTime: '17:00',
        title: 'Day 1',
      };
      const result = sessionSchema.safeParse(invalidSession);
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidSession = {
        date: '2026-02-14',
        startTime: '9:00 AM',
        endTime: '5:00 PM',
        title: 'Day 1',
      };
      const result = sessionSchema.safeParse(invalidSession);
      expect(result.success).toBe(false);
    });
  });

  describe('createProgramSchema', () => {
    const validProgramData = {
      teacherId: '550e8400-e29b-41d4-a716-446655440000',
      templateId: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Weekend Intensive',
      slug: 'weekend-intensive',
      description: 'A transformative weekend experience',
      venueType: 'IN_PERSON' as const,
      venueId: '550e8400-e29b-41d4-a716-446655440002',
      sessions: [
        {
          date: '2026-02-14',
          startTime: '09:00',
          endTime: '17:00',
          title: 'Day 1',
        },
      ],
      capacity: 30,
      isFree: false,
      priceAmount: 100,
      priceCurrency: 'USD',
      allowPayAtVenue: false,
      status: 'DRAFT' as const,
    };

    it('should validate a complete program', () => {
      const result = createProgramSchema.safeParse(validProgramData);
      expect(result.success).toBe(true);
    });

    it('should require at least one session', () => {
      const invalidData = { ...validProgramData, sessions: [] };
      const result = createProgramSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject reserved slugs', () => {
      const invalidData = { ...validProgramData, slug: 'new' };
      const result = createProgramSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require price for paid programs', () => {
      const invalidData = {
        ...validProgramData,
        isFree: false,
        priceAmount: undefined,
      };
      const result = createProgramSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept free programs without price', () => {
      const freeProgram = {
        ...validProgramData,
        isFree: true,
        priceAmount: undefined,
      };
      const result = createProgramSchema.safeParse(freeProgram);
      expect(result.success).toBe(true);
    });

    it('should require venue for in-person programs', () => {
      const invalidData = {
        ...validProgramData,
        venueType: 'IN_PERSON' as const,
        venueId: undefined,
      };
      const result = createProgramSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require meeting details for online programs', () => {
      const invalidData = {
        ...validProgramData,
        venueType: 'ONLINE' as const,
        venueId: undefined,
        onlineMeetingProvider: undefined,
        onlineMeetingUrl: undefined,
      };
      const result = createProgramSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should auto-prepend https:// to meeting URLs', () => {
      const dataWithoutProtocol = {
        ...validProgramData,
        venueType: 'ONLINE' as const,
        venueId: undefined,
        onlineMeetingProvider: 'ZOOM' as const,
        onlineMeetingUrl: 'zoom.us/j/123456789',
      };
      const result = createProgramSchema.safeParse(dataWithoutProtocol);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.onlineMeetingUrl).toBe('https://zoom.us/j/123456789');
      }
    });
  });
});
