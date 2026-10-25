import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../index';

describe('Server API Routes Integration Tests', () => {
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
      const payload = {
        currentPlan: {
          name: 'Current Plan',
          type: 'wedding',
          totalBudget: 500000,
          guests: 200,
          budgetCategories: [
            { id: 'c-1', name: 'Catering & Food', allocatedAmount: 160000, actualAmount: 0, percentage: 32 },
            { id: 'c-2', name: 'Venue & Space', allocatedAmount: 140000, actualAmount: 0, percentage: 28 }
          ]
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
