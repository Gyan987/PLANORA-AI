import {
  EventIdea,
  EventPlan,
  EventRisk,
  WhatIfSimulationResult
} from '../types';

const API_BASE_URL = '/api/ai';

export const api = {
  // Generate structured event plan
  async generatePlan(data: any): Promise<EventPlan> {
    const response = await fetch(`${API_BASE_URL}/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to generate plan');
    }

    const json = await response.json();
    return json.data;
  },

  // AI Budget Rescue
  async rescueBudget(data: any): Promise<{
    overspendAmount: number;
    isOverBudget: boolean;
    explanation: string;
    recommendations: any[];
    proposedCategories: any[];
  }> {
    const response = await fetch(`${API_BASE_URL}/budget-rescue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to audit budget');
    }

    const json = await response.json();
    return json.data;
  },

  // What-If Simulator
  async simulateWhatIf(currentPlan: EventPlan, simulatedChanges: any): Promise<WhatIfSimulationResult> {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPlan, simulatedChanges })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to run what-if simulation');
    }

    const json = await response.json();
    return json.data;
  },

  // Context-aware chat assistant
  async chatAssistant(
    message: string,
    history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    eventContext: EventPlan
  ): Promise<{ response: string; suggestedAction?: any }> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, eventContext })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to communicate with AI Assistant');
    }

    const json = await response.json();
    return json.data;
  },

  // Dynamic ideas
  async getIdeas(params: any): Promise<EventIdea[]> {
    const response = await fetch(`${API_BASE_URL}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch ideas');
    }

    const json = await response.json();
    return json.data;
  },

  // Risk analysis
  async analyzeRisks(eventPlan: EventPlan): Promise<EventRisk[]> {
    const response = await fetch(`${API_BASE_URL}/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventPlan })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to analyze risks');
    }

    const json = await response.json();
    return json.data;
  }
};
