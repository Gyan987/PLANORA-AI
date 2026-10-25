import { beforeEach, describe, expect, it, vi } from 'vitest';
import { geminiService } from '../../services/geminiService';
import { EventPlan } from '../../types';

describe('Gemini API Failure & Resilience Unit Tests', () => {
  const sampleEventPlan: EventPlan = {
    id: 'test-evt-1',
    name: 'Sample Celebration',
    type: 'wedding',
    date: '2026-11-20',
    city: 'Kolkata',
    guests: 150,
    totalBudget: 400000,
    currency: 'INR',
    durationHours: 6,
    language: 'English',
    indoorOutdoor: 'Indoor',
    topPriorities: ['Catering', 'Decor'],
    overviewSummary: 'Existing overview',
    budgetCategories: [
      { id: 'cat-1', name: 'Venue & Space', allocatedAmount: 120000, actualAmount: 0, percentage: 30 },
      { id: 'cat-2', name: 'Catering & Food', allocatedAmount: 140000, actualAmount: 0, percentage: 35 },
      { id: 'cat-3', name: 'Decoration & Florals', allocatedAmount: 60000, actualAmount: 0, percentage: 15 },
      { id: 'cat-4', name: 'Emergency Reserve', allocatedAmount: 20000, actualAmount: 0, percentage: 5 }
    ],
    expenses: [],
    tasks: [],
    daySchedule: [],
    vendors: [],
    ideas: [],
    risks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateCompletePlan Resilience', () => {
    it('returns a fully formed event plan even when external Gemini call fails with Network Error', async () => {
      // Mock ai.models.generateContent to throw a network error
      const mockError = new Error('getaddrinfo ENOTFOUND generativelanguage.googleapis.com');
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockRejectedValueOnce(mockError);

      const plan = await geminiService.generateCompletePlan({
        name: 'Offline Bengali Wedding',
        type: 'wedding',
        date: '2026-11-20',
        city: 'Kolkata',
        guests: 150,
        totalBudget: 400000,
        indoorOutdoor: 'Indoor',
        culturalTradition: 'Traditional Bengali'
      });

      expect(plan).toBeDefined();
      expect(plan.name).toBe('Offline Bengali Wedding');
      expect(plan.budgetCategories.length).toBeGreaterThan(0);
      expect(plan.tasks.length).toBeGreaterThan(0);
      expect(plan.vendors.length).toBeGreaterThan(0);
      expect(plan.overviewSummary).toBeDefined();
      expect(plan.overviewSummary.length).toBeGreaterThan(20);
    });

    it('recovers gracefully when Gemini returns malformed/corrupted JSON', async () => {
      // Mock response with malformed JSON
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockResolvedValueOnce({
        text: '```json { "overviewSummary": "Incomplete json string without closing braces'
      });

      const plan = await geminiService.generateCompletePlan({
        name: 'Malformed JSON Test Event',
        type: 'wedding',
        date: '2026-12-01',
        city: 'Mumbai',
        guests: 100,
        totalBudget: 300000,
        indoorOutdoor: 'Indoor'
      });

      expect(plan).toBeDefined();
      expect(plan.budgetCategories.length).toBeGreaterThan(0);
      expect(plan.overviewSummary).toBeDefined();
    });

    it('handles rate-limiting HTTP 429 / 503 without crashing', async () => {
      const rateLimitError = new Error('Resource has been exhausted (e.g. check quota). HTTP 429');
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockRejectedValueOnce(rateLimitError);

      const plan = await geminiService.generateCompletePlan({
        name: 'Rate Limited Event',
        type: 'birthday',
        date: '2026-10-30',
        city: 'Pune',
        guests: 40,
        totalBudget: 20000,
        indoorOutdoor: 'Indoor'
      });

      expect(plan).toBeDefined();
      expect(plan.budgetCategories.length).toBeGreaterThan(0);
      expect(plan.tasks.length).toBeGreaterThan(0);
    });

    it('handles response with missing required fields by using fallback contingency', async () => {
      // Return JSON missing contingencySuggestions
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockResolvedValueOnce({
        text: JSON.stringify({ overviewSummary: 'Custom AI overview without contingency array' })
      });

      const plan = await geminiService.generateCompletePlan({
        name: 'Partial Fields Event',
        type: 'wedding',
        date: '2026-11-15',
        city: 'Jaipur',
        guests: 200,
        totalBudget: 1000000,
        indoorOutdoor: 'Hybrid'
      });

      expect(plan.overviewSummary).toBe('Custom AI overview without contingency array');
      expect(plan.contingencySuggestions).toBeDefined();
      expect(plan.contingencySuggestions?.length).toBeGreaterThan(0);
    });
  });

  describe('rescueBudget Resilience', () => {
    it('computes deterministic financial cuts when Gemini service times out or errors', async () => {
      const timeoutError = new Error('AI generation timed out after 7000ms');
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockRejectedValueOnce(timeoutError);

      const rescueResult = await geminiService.rescueBudget({
        totalBudget: 400000,
        currentExpenses: 440000, // ₹40k overspend
        categories: sampleEventPlan.budgetCategories,
        eventType: 'wedding',
        guests: 150,
        city: 'Kolkata'
      });

      expect(rescueResult.isOverBudget).toBe(true);
      expect(rescueResult.overspendAmount).toBe(40000);
      expect(rescueResult.recommendations.length).toBeGreaterThan(0);

      const totalCut = rescueResult.recommendations.reduce((sum, r) => sum + r.savings, 0);
      expect(totalCut).toBeGreaterThan(0);
      expect(rescueResult.explanation).toBeDefined();
    });

    it('returns positive headroom explanation when event is within budget', async () => {
      const rescueResult = await geminiService.rescueBudget({
        totalBudget: 400000,
        currentExpenses: 300000,
        categories: sampleEventPlan.budgetCategories,
        eventType: 'wedding',
        guests: 150,
        city: 'Kolkata'
      });

      expect(rescueResult.isOverBudget).toBe(false);
      expect(rescueResult.overspendAmount).toBe(0);
      expect(rescueResult.recommendations.length).toBe(0);
      expect(rescueResult.explanation).toContain('well-balanced');
    });
  });

  describe('simulateWhatIf Resilience', () => {
    it('computes deterministic cost per guest and feasibility even when AI call fails', async () => {
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockRejectedValueOnce(new Error('Gemini API Error'));

      const result = await geminiService.simulateWhatIf(sampleEventPlan, {
        guests: 300, // Doubling guests without increasing budget
        totalBudget: 400000
      });

      expect(result).toBeDefined();
      expect(result.originalValues.guests).toBe(150);
      expect(result.proposedValues.guests).toBe(300);
      expect(result.budgetImpact.feasibility).toBe('Deficit');
      expect(result.tradeOffs.length).toBeGreaterThan(0);
      expect(result.scheduleAndVendorImpacts.length).toBeGreaterThan(0);
      expect(result.summary).toContain('300 guests');
    });
  });

  describe('chatWithAssistant Resilience', () => {
    it('provides grounded fallback response with event figures when Gemini throws an error', async () => {
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockRejectedValueOnce(new Error('Quota exceeded'));

      const reply = await geminiService.chatWithAssistant(
        'What should I prioritize?',
        [],
        sampleEventPlan
      );

      expect(reply.response).toBeDefined();
      expect(reply.response).toContain('Sample Celebration');
      expect(reply.response).toContain('4,00,000');
    });
  });

  describe('analyzeRisks & getPersonalizedIdeas Resilience', () => {
    it('returns deterministic risks when Gemini analysis fails', async () => {
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockRejectedValueOnce(new Error('Network error'));

      const risks = await geminiService.analyzeRisks(sampleEventPlan);
      expect(risks.length).toBeGreaterThanOrEqual(3);
      expect(risks.some((r) => r.severity === 'High' || r.severity === 'Medium')).toBe(true);
    });

    it('returns deterministic ideas when Gemini ideas call fails', async () => {
      // @ts-ignore
      vi.spyOn(geminiService['ai'].models, 'generateContent').mockRejectedValueOnce(new Error('Network error'));

      const ideas = await geminiService.getPersonalizedIdeas({
        eventType: 'wedding',
        city: 'Kolkata',
        culturalTradition: 'Bengali',
        guests: 150,
        totalBudget: 400000
      });

      expect(ideas.length).toBeGreaterThanOrEqual(2);
      expect(ideas.some((i) => i.title.toLowerCase().includes('dhak') || i.title.toLowerCase().includes('shola'))).toBe(true);
    });
  });
});
