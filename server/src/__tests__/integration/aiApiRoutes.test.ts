import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../index';
import { geminiService } from '../../services/geminiService';

describe('Server API Routes Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('returns healthy status and metadata', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('Planora AI Backend');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/ai/generate-plan', () => {
    it('generates a complete structured plan when valid payload is submitted', async () => {
      vi.spyOn(geminiService, 'generateCompletePlan').mockResolvedValueOnce({
        id: 'plan-123',
        name: 'Sourav & Priya Engagement',
        type: 'wedding',
        date: '2026-11-25',
        city: 'Kolkata',
        guests: 100,
        totalBudget: 350000,
        currency: 'INR',
        durationHours: 6,
        language: 'English',
        indoorOutdoor: 'Indoor',
        topPriorities: ['Catering', 'Decor'],
        overviewSummary: 'Sophisticated Bengali Engagement celebration with authentic culinary spread.',
        budgetCategories: [
          { id: 'cat-1', name: 'Venue & Space', allocatedAmount: 105000, actualAmount: 0, percentage: 30 }
        ],
        expenses: [],
        tasks: [
          { id: 't-1', title: 'Confirm Menu', category: 'Catering', priority: 'High', dueDate: '2026-11-20', completed: false }
        ],
        daySchedule: [],
        vendors: [
          { id: 'v-1', name: 'Grand Foyer', category: 'Venue', estimatedPrice: 105000, agreedPrice: 105000, bookingStatus: 'Shortlisted', paymentStatus: 'Unpaid' }
        ],
        ideas: [],
        risks: [],
        contingencySuggestions: ['Book advance vendors early.'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const payload = {
        name: 'Sourav & Priya Engagement',
        type: 'wedding',
        date: '2026-11-25',
        city: 'Kolkata',
        guests: 100,
        totalBudget: 350000,
        currency: 'INR',
        indoorOutdoor: 'Indoor',
        culturalTradition: 'Bengali'
      };

      const res = await request(app)
        .post('/api/ai/generate-plan')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toBe('Sourav & Priya Engagement');
      expect(res.body.data.budgetCategories.length).toBeGreaterThan(0);
      expect(res.body.data.tasks.length).toBeGreaterThan(0);
      expect(res.body.data.vendors.length).toBeGreaterThan(0);
    });

    it('returns 400 with validation details when required fields are missing', async () => {
      const invalidPayload = {
        name: 'Incomplete',
        guests: 0 // invalid: must be positive
      };

      const res = await request(app)
        .post('/api/ai/generate-plan')
        .send(invalidPayload);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toBeDefined();
    });
  });

  describe('POST /api/ai/budget-rescue', () => {
    it('successfully processes budget rescue audit', async () => {
      vi.spyOn(geminiService, 'rescueBudget').mockResolvedValueOnce({
        overspendAmount: 40000,
        isOverBudget: true,
        explanation: 'Cut floral imports to recover overspend.',
        recommendations: [
          {
            category: 'Decoration & Florals',
            currentAllocation: 60000,
            proposedAllocation: 45000,
            savings: 15000,
            action: 'Switch to seasonal blooms',
            tradeoff: 'Slightly simpler aesthetics'
          }
        ],
        proposedCategories: []
      });

      const payload = {
        totalBudget: 400000,
        currentExpenses: 440000,
        categories: [
          { id: 'cat-1', name: 'Venue & Space', allocatedAmount: 140000, actualAmount: 150000 },
          { id: 'cat-2', name: 'Catering & Food', allocatedAmount: 160000, actualAmount: 170000 }
        ],
        eventType: 'wedding',
        guests: 150,
        city: 'Kolkata'
      };

      const res = await request(app)
        .post('/api/ai/budget-rescue')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isOverBudget).toBe(true);
      expect(res.body.data.overspendAmount).toBe(40000);
    });

    it('returns 400 for invalid budget rescue inputs', async () => {
      const res = await request(app)
        .post('/api/ai/budget-rescue')
        .send({ totalBudget: -500 });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/ai/simulate', () => {
    it('returns what-if simulation comparison', async () => {
      vi.spyOn(geminiService, 'simulateWhatIf').mockResolvedValueOnce({
        originalValues: { totalBudget: 500000, guests: 200, costPerGuest: 2500, venueEstimate: 140000, cateringEstimate: 160000 },
        proposedValues: { totalBudget: 550000, guests: 250, costPerGuest: 2200, venueEstimate: 154000, cateringEstimate: 176000 },
        budgetImpact: {
          difference: 50000,
          feasibility: 'Tight',
          details: 'Feasible with buffer'
        },
        tradeOffs: ['Consolidate live counters to maintain per-plate quality'],
        scheduleAndVendorImpacts: ['Requires additional 50 chairs from decorator'],
        actionableRecommendations: ['Confirm decorator numbers 10 days ahead'],
        proposedCategories: [],
        summary: 'Expanding to 250 guests is feasible with ₹50,000 budget addition.'
      });

      const payload = {
        currentPlan: {
          id: 'plan-curr-1',
          name: 'Current Plan',
          type: 'wedding' as const,
          date: '2026-11-28',
          city: 'Kolkata',
          currency: 'INR',
          indoorOutdoor: 'Indoor' as const,
          overviewSummary: 'Current plan summary',
          totalBudget: 500000,
          guests: 200,
          budgetCategories: [
            { id: 'c-1', name: 'Catering & Food', allocatedAmount: 160000, actualAmount: 0, percentage: 32 },
            { id: 'c-2', name: 'Venue & Space', allocatedAmount: 140000, actualAmount: 0, percentage: 28 }
          ],
          expenses: [],
          tasks: [],
          daySchedule: [],
          vendors: [],
          ideas: [],
          risks: [],
          contingencySuggestions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        simulatedChanges: {
          guests: 250,
          totalBudget: 550000
        }
      };

      const res = await request(app)
        .post('/api/ai/simulate')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.proposedValues.guests).toBe(250);
      expect(res.body.data.budgetImpact).toBeDefined();
    });
  });

  describe('POST /api/ai/chat', () => {
    it('returns assistant response given valid context', async () => {
      vi.spyOn(geminiService, 'chatWithAssistant').mockResolvedValueOnce({
        response: 'For distributing return favors, setting up a personalized gift desk at the banquet exit ensures no guest is missed.'
      });

      const payload = {
        message: 'What is the best way to distribute return favors?',
        history: [],
        eventContext: {
          name: 'My Celebration',
          type: 'wedding',
          city: 'Kolkata',
          totalBudget: 500000,
          guests: 200,
          date: '2026-11-28'
        }
      };

      const res = await request(app)
        .post('/api/ai/chat')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.response).toBeDefined();
    });
  });

  describe('POST /api/ai/ideas and POST /api/ai/risks', () => {
    it('POST /api/ai/ideas returns curated suggestions', async () => {
      vi.spyOn(geminiService, 'getPersonalizedIdeas').mockResolvedValueOnce([
        {
          id: 'idea-1',
          title: 'Live Shola Pith Craft Station',
          description: 'Traditional Bengali artisan creating miniature wedding tokens.',
          category: 'Cultural',
          estimatedCostRange: '₹15,000 - ₹25,000',
          suitability: 'High',
          implementationTips: ['Book local artisan 3 weeks in advance']
        }
      ]);

      const res = await request(app)
        .post('/api/ai/ideas')
        .send({
          eventType: 'wedding',
          culturalTradition: 'Bengali',
          city: 'Kolkata',
          guests: 200,
          totalBudget: 500000
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/ai/risks returns analyzed event risks', async () => {
      vi.spyOn(geminiService, 'analyzeRisks').mockResolvedValueOnce([
        {
          id: 'risk-1',
          description: 'Dew or unseasonal rain on open lawn',
          severity: 'High',
          reason: 'Open lawn exposure in late November',
          recommendedAction: 'Reserve waterproof marquee canopy',
          deadline: '2026-11-20'
        }
      ]);

      const res = await request(app)
        .post('/api/ai/risks')
        .send({
          eventPlan: {
            name: 'Outdoor Celebration',
            type: 'wedding',
            date: '2026-12-15',
            indoorOutdoor: 'Outdoor',
            totalBudget: 600000,
            city: 'Kolkata'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
