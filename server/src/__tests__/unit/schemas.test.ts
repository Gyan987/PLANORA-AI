import { describe, expect, it } from 'vitest';
import {
  BudgetRescueInputSchema,
  ChatInputSchema,
  EventCreationInputSchema,
  IdeasInputSchema,
  RiskInputSchema,
  WhatIfInputSchema
} from '../../schemas/aiSchemas';

describe('Zod Input Schemas & Edge Cases', () => {
  describe('EventCreationInputSchema', () => {
    const validPlan = {
      name: 'Priyanka & Arjun Wedding',
      type: 'wedding',
      date: '2026-12-15',
      city: 'Delhi',
      guests: 150,
      totalBudget: 800000,
      currency: 'INR',
      indoorOutdoor: 'Indoor'
    };

    it('validates a complete, correct event creation payload', () => {
      const res = EventCreationInputSchema.safeParse(validPlan);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.durationHours).toBe(6); // Default applied
        expect(res.data.currency).toBe('INR');
      }
    });

    it('rejects an empty form or missing required fields', () => {
      const res = EventCreationInputSchema.safeParse({});
      expect(res.success).toBe(false);
      if (!res.success) {
        const fields = res.error.issues.map((i) => i.path[0]);
        expect(fields).toContain('name');
        expect(fields).toContain('type');
        expect(fields).toContain('date');
        expect(fields).toContain('city');
        expect(fields).toContain('guests');
        expect(fields).toContain('totalBudget');
      }
    });

    it('rejects negative budgets and zero budgets', () => {
      const negativeBudget = { ...validPlan, totalBudget: -50000 };
      expect(EventCreationInputSchema.safeParse(negativeBudget).success).toBe(false);

      const zeroBudget = { ...validPlan, totalBudget: 0 };
      expect(EventCreationInputSchema.safeParse(zeroBudget).success).toBe(false);
    });

    it('rejects negative or zero guest counts', () => {
      const negativeGuests = { ...validPlan, guests: -10 };
      expect(EventCreationInputSchema.safeParse(negativeGuests).success).toBe(false);

      const zeroGuests = { ...validPlan, guests: 0 };
      expect(EventCreationInputSchema.safeParse(zeroGuests).success).toBe(false);
    });

    it('rejects fractional guest counts (guests must be integer)', () => {
      const fractionalGuests = { ...validPlan, guests: 125.5 };
      expect(EventCreationInputSchema.safeParse(fractionalGuests).success).toBe(false);
    });

    it('accepts very large guest counts without crashing', () => {
      const largeGuests = { ...validPlan, guests: 50000 };
      const res = EventCreationInputSchema.safeParse(largeGuests);
      expect(res.success).toBe(true);
    });

    it('rejects invalid event types', () => {
      const invalidType = { ...validPlan, type: 'extraterrestrial-rave' };
      expect(EventCreationInputSchema.safeParse(invalidType).success).toBe(false);
    });

    it('rejects short event names (< 2 chars)', () => {
      const shortName = { ...validPlan, name: 'A' };
      expect(EventCreationInputSchema.safeParse(shortName).success).toBe(false);
    });

    it('allows optional cultural fields and arrays', () => {
      const withOptionals = {
        ...validPlan,
        culturalTradition: 'Traditional Punjabi Anand Karaj',
        theme: 'Royal Marigold & Velvet',
        topPriorities: ['Food', 'Bhangra', 'Photography'],
        userPrompt: 'Grand evening with live dhol'
      };
      const res = EventCreationInputSchema.safeParse(withOptionals);
      expect(res.success).toBe(true);
    });
  });

  describe('BudgetRescueInputSchema', () => {
    it('validates a valid budget rescue request', () => {
      const payload = {
        totalBudget: 500000,
        currentExpenses: 550000,
        categories: [
          { id: 'cat-1', name: 'Venue', allocatedAmount: 150000, actualAmount: 160000 },
          { id: 'cat-2', name: 'Catering', allocatedAmount: 180000, actualAmount: 200000 }
        ],
        eventType: 'wedding',
        guests: 200,
        city: 'Kolkata'
      };
      const res = BudgetRescueInputSchema.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('rejects negative total budget', () => {
      const payload = {
        totalBudget: -100,
        currentExpenses: 500,
        categories: [],
        eventType: 'wedding',
        guests: 50,
        city: 'Mumbai'
      };
      expect(BudgetRescueInputSchema.safeParse(payload).success).toBe(false);
    });

    it('rejects negative current expenses', () => {
      const payload = {
        totalBudget: 500000,
        currentExpenses: -20000,
        categories: [],
        eventType: 'wedding',
        guests: 50,
        city: 'Mumbai'
      };
      expect(BudgetRescueInputSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe('ChatInputSchema', () => {
    it('validates chat message with context and history', () => {
      const payload = {
        message: 'How can I save on wedding decor in Kolkata?',
        history: [{ role: 'user', content: 'Hello' }],
        eventContext: { name: 'My Wedding', totalBudget: 500000 }
      };
      const res = ChatInputSchema.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('rejects empty message strings', () => {
      const payload = {
        message: '',
        eventContext: {}
      };
      expect(ChatInputSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe('WhatIfInputSchema', () => {
    it('validates what-if simulation inputs with partial proposed changes', () => {
      const payload = {
        currentPlan: { name: 'Test', totalBudget: 100000, guests: 50 },
        simulatedChanges: {
          guests: 75,
          totalBudget: 120000
        }
      };
      const res = WhatIfInputSchema.safeParse(payload);
      expect(res.success).toBe(true);
    });

    it('rejects invalid indoorOutdoor setting in what-if simulation', () => {
      const payload = {
        currentPlan: {},
        simulatedChanges: {
          indoorOutdoor: 'UndergroundBunker'
        }
      };
      expect(WhatIfInputSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe('RiskInputSchema & IdeasInputSchema', () => {
    it('validates RiskInputSchema', () => {
      const res = RiskInputSchema.safeParse({ eventPlan: { name: 'Plan' } });
      expect(res.success).toBe(true);
    });

    it('validates IdeasInputSchema', () => {
      const res = IdeasInputSchema.safeParse({
        eventType: 'birthday',
        city: 'Bengaluru',
        guests: 30,
        totalBudget: 25000
      });
      expect(res.success).toBe(true);
    });
  });
});
