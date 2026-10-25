import { describe, expect, it } from 'vitest';
import {
  calculateMilestoneDates,
  generateDeterministicBudgetCategories,
  generateDeterministicDaySchedule,
  generateDeterministicIdeas,
  generateDeterministicRisks,
  generateDeterministicTasks,
  generateDeterministicVendors
} from '../../services/geminiService';
import { EventType } from '../../types';

describe('Deterministic Financial & Planning Calculations', () => {
  describe('generateDeterministicBudgetCategories', () => {
    it('allocates 100% of budget across categories for a wedding with exact sum equality', () => {
      const totalBudget = 500000;
      const categories = generateDeterministicBudgetCategories(totalBudget, 'wedding');

      expect(categories.length).toBeGreaterThan(0);
      const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
      expect(allocatedSum).toBe(totalBudget);

      // Verify category names and color assignments
      const names = categories.map((c) => c.name);
      expect(names).toContain('Venue & Space');
      expect(names).toContain('Catering & Food');
      expect(names).toContain('Emergency Reserve');
    });

    it('allocates 100% of budget for birthday events', () => {
      const totalBudget = 25000;
      const categories = generateDeterministicBudgetCategories(totalBudget, 'birthday');

      const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
      expect(allocatedSum).toBe(totalBudget);
      expect(categories.some((c) => c.name.includes('Party Hall'))).toBe(true);
      expect(categories.some((c) => c.name.includes('Food & Beverages'))).toBe(true);
    });

    it('allocates 100% of budget for community events', () => {
      const totalBudget = 1000000;
      const categories = generateDeterministicBudgetCategories(totalBudget, 'community');

      const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
      expect(allocatedSum).toBe(totalBudget);
      expect(categories.some((c) => c.name.includes('Sound, Lights & AV'))).toBe(true);
    });

    it('allocates 100% of budget for custom or unspecified event types', () => {
      const totalBudget = 75000;
      const categories = generateDeterministicBudgetCategories(totalBudget, 'custom' as EventType);

      const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
      expect(allocatedSum).toBe(totalBudget);
    });

    it('handles zero budget safely without NaN or negative values', () => {
      const categories = generateDeterministicBudgetCategories(0, 'wedding');
      expect(categories.length).toBeGreaterThan(0);
      categories.forEach((cat) => {
        expect(cat.allocatedAmount).toBe(0);
        expect(cat.actualAmount).toBe(0);
        expect(cat.percentage).toBe(0);
        expect(isNaN(cat.percentage!)).toBe(false);
      });
    });

    it('allocates exactly ₹199 without producing ₹200 (regression test for exact-sum algorithm)', () => {
      const totalBudget = 199;
      const categories = generateDeterministicBudgetCategories(totalBudget, 'wedding');
      const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);

      // Must be exactly 199, never 200
      expect(allocatedSum).toBe(199);
      expect(allocatedSum).not.toBe(200);

      // Every category must have a non-negative integer allocation
      categories.forEach((cat) => {
        expect(Number.isInteger(cat.allocatedAmount)).toBe(true);
        expect(cat.allocatedAmount).toBeGreaterThanOrEqual(0);
      });
    });

    it('allocates exact sums for small irregular budgets (₹1, ₹7, ₹23, ₹99, ₹199) across event types', () => {
      const smallBudgets = [1, 7, 23, 99, 199];
      const eventTypes: EventType[] = ['wedding', 'birthday', 'community', 'custom' as EventType];

      smallBudgets.forEach((budget) => {
        eventTypes.forEach((type) => {
          const categories = generateDeterministicBudgetCategories(budget, type);
          const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
          expect(allocatedSum).toBe(budget);
        });
      });
    });

    it('handles floating point budgets without precision leaks', () => {
      const totalBudget = 333333;
      const categories = generateDeterministicBudgetCategories(totalBudget, 'wedding');
      const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
      expect(allocatedSum).toBe(totalBudget);
    });

    it('allocates exact sums for large and irregular budgets (₹1,234,567 and ₹99,999,999)', () => {
      const largeBudgets = [1234567, 50000000, 99999999];
      largeBudgets.forEach((budget) => {
        const categories = generateDeterministicBudgetCategories(budget, 'wedding');
        const allocatedSum = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
        expect(allocatedSum).toBe(budget);
      });
    });
  });

  describe('calculateMilestoneDates', () => {
    it('generates milestone dates strictly in the past relative to the event date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      const eventDateStr = futureDate.toISOString().split('T')[0];

      const relativeDays = [60, 45, 30, 15, 7, 1];
      const dates = calculateMilestoneDates(eventDateStr, relativeDays);

      expect(dates.length).toBe(relativeDays.length);
      dates.forEach((date) => {
        expect(date <= eventDateStr).toBe(true);
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('handles near-term events (e.g. tomorrow) gracefully without negative date bugs', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const eventDateStr = tomorrow.toISOString().split('T')[0];

      const relativeDays = [180, 90, 30, 1];
      const dates = calculateMilestoneDates(eventDateStr, relativeDays);

      expect(dates.length).toBe(relativeDays.length);
      dates.forEach((date) => {
        expect(date <= eventDateStr).toBe(true);
      });
    });
  });

  describe('generateDeterministicTasks', () => {
    it('produces structured tasks with priorities and due dates', () => {
      const eventDate = '2026-12-31';
      const tasks = generateDeterministicTasks(eventDate, 'wedding');

      expect(tasks.length).toBeGreaterThanOrEqual(5);
      tasks.forEach((task) => {
        expect(task.id).toBeDefined();
        expect(task.title.length).toBeGreaterThan(0);
        expect(['High', 'Medium', 'Low']).toContain(task.priority);
        expect(task.completed).toBe(false);
      });
    });
  });

  describe('generateDeterministicDaySchedule', () => {
    it('generates a sequential day schedule for weddings', () => {
      const schedule = generateDeterministicDaySchedule('wedding');
      expect(schedule.length).toBeGreaterThan(5);
      expect(schedule[0].activity).toContain('Makeup');
      expect(schedule[schedule.length - 1].activity).toContain('Send-off');
    });

    it('generates an appropriate day schedule for birthday parties', () => {
      const schedule = generateDeterministicDaySchedule('birthday');
      expect(schedule.some((s) => s.activity.includes('Cake'))).toBe(true);
    });
  });

  describe('generateDeterministicVendors', () => {
    it('creates matching vendors for non-reserve budget categories with contacts and pricing', () => {
      const categories = generateDeterministicBudgetCategories(500000, 'wedding');
      const vendors = generateDeterministicVendors(categories, 'Kolkata', 'wedding');

      expect(vendors.length).toBeGreaterThan(0);
      vendors.forEach((v) => {
        expect(v.id).toBeDefined();
        expect(v.name).toBeDefined();
        expect(v.category).toBeDefined();
        expect(v.phone).toMatch(/^\+91/);
        expect(v.estimatedPrice).toBeGreaterThan(0);
        expect(['Researching', 'Shortlisted', 'Contacted', 'Negotiating', 'Booked', 'Completed']).toContain(v.bookingStatus);
      });

      // Does not create a vendor for Emergency Reserve
      expect(vendors.some((v) => v.name.includes('Reserve') || v.category.includes('Reserve'))).toBe(false);
    });
  });

  describe('generateDeterministicRisks', () => {
    it('flags weather risks for outdoor celebrations', () => {
      const risks = generateDeterministicRisks('Outdoor', 30, 500000);
      expect(risks.some((r) => r.description.toLowerCase().includes('weather'))).toBe(true);
      expect(risks.some((r) => r.severity === 'Critical' || r.severity === 'High')).toBe(true);
    });

    it('does not flag severe weather risks for indoor celebrations', () => {
      const risks = generateDeterministicRisks('Indoor', 30, 500000);
      expect(risks.some((r) => r.description.toLowerCase().includes('rain') || r.description.toLowerCase().includes('weather'))).toBe(false);
    });

    it('calculates emergency reserve ratio based on total budget', () => {
      const totalBudget = 600000;
      const risks = generateDeterministicRisks('Indoor', 45, totalBudget);
      const reserveRisk = risks.find((r) => r.description.toLowerCase().includes('reserve'));
      expect(reserveRisk).toBeDefined();
      expect(reserveRisk?.recommendedAction).toContain('30,000'); // 5% of 600,000
    });
  });

  describe('generateDeterministicIdeas', () => {
    it('includes Bengali heritage ideas when culture or city is Kolkata', () => {
      const ideas = generateDeterministicIdeas('wedding', 'Bengali', 'Rajbari Heritage', 'Kolkata');
      expect(ideas.length).toBeGreaterThanOrEqual(2);
      expect(ideas.some((i) => i.title.toLowerCase().includes('dhak') || i.title.toLowerCase().includes('shola'))).toBe(true);
    });
  });
});
