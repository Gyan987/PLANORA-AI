import { describe, expect, it } from 'vitest';
import {
  calculateDaysRemaining,
  calculatePercentage,
  formatCompactINR,
  formatINR
} from '../../utils/currency';

describe('Client Currency & Metric Calculations Unit Tests', () => {
  describe('formatINR', () => {
    it('formats positive numbers into Indian Rupee currency string', () => {
      const formatted = formatINR(500000);
      // Clean non-breaking space
      const cleaned = formatted.replace(/\u00a0/g, ' ');
      expect(cleaned).toMatch(/₹\s*5,00,000/);
    });

    it('formats 0 properly as ₹0', () => {
      const formatted = formatINR(0).replace(/\u00a0/g, ' ');
      expect(formatted).toMatch(/₹\s*0/);
    });

    it('handles undefined, null, and NaN safely without throwing errors', () => {
      expect(formatINR(undefined)).toBe('₹0');
      expect(formatINR(null)).toBe('₹0');
      expect(formatINR(NaN)).toBe('₹0');
    });

    it('formats negative amounts properly', () => {
      const formatted = formatINR(-25000).replace(/\u00a0/g, ' ');
      expect(formatted).toContain('25,000');
    });

    it('handles very large numbers in crores', () => {
      const formatted = formatINR(10000000).replace(/\u00a0/g, ' ');
      expect(formatted).toMatch(/₹\s*1,00,00,000/);
    });
  });

  describe('formatCompactINR', () => {
    it('formats crores (>= 1,00,00,000) with Cr suffix', () => {
      expect(formatCompactINR(15000000)).toBe('₹1.50 Cr');
      expect(formatCompactINR(10000000)).toBe('₹1.00 Cr');
    });

    it('formats lakhs (>= 1,00,000) with L suffix', () => {
      expect(formatCompactINR(500000)).toBe('₹5.00 L');
      expect(formatCompactINR(250000)).toBe('₹2.50 L');
      expect(formatCompactINR(100000)).toBe('₹1.00 L');
    });

    it('formats thousands (>= 1,000) with k suffix', () => {
      expect(formatCompactINR(50000)).toBe('₹50.0k');
      expect(formatCompactINR(5000)).toBe('₹5.0k');
    });

    it('formats amounts below 1000 as regular localized numbers', () => {
      expect(formatCompactINR(850)).toBe('₹850');
      expect(formatCompactINR(0)).toBe('₹0');
    });
  });

  describe('calculateDaysRemaining', () => {
    it('returns 0 for empty or invalid date strings', () => {
      expect(calculateDaysRemaining('')).toBe(0);
      // @ts-ignore
      expect(calculateDaysRemaining(null)).toBe(0);
    });

    it('returns positive days for dates in the future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      const str = future.toISOString().split('T')[0];
      const days = calculateDaysRemaining(str);
      expect(days).toBeGreaterThanOrEqual(29);
      expect(days).toBeLessThanOrEqual(31);
    });

    it('returns 0 for today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(calculateDaysRemaining(today)).toBe(0);
    });

    it('returns negative days for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const str = past.toISOString().split('T')[0];
      expect(calculateDaysRemaining(str)).toBeLessThan(0);
    });
  });

  describe('calculatePercentage', () => {
    it('calculates accurate percentages with 1 decimal precision', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33.3);
      expect(calculatePercentage(2, 3)).toBe(66.7);
    });

    it('safely handles zero or negative total without dividing by zero', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
      expect(calculatePercentage(50, -10)).toBe(0);
    });

    it('caps percentage at 100% when part exceeds total', () => {
      expect(calculatePercentage(150, 100)).toBe(100);
    });

    it('clamps negative parts to 0%', () => {
      expect(calculatePercentage(-20, 100)).toBe(0);
    });
  });
});
