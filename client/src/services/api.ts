import {
  BudgetCategory,
  EventIdea,
  EventPlan,
  EventRisk,
  EventType,
  WhatIfSimulationResult
} from '../types';

const API_BASE_URL = '/api/ai';

export interface GeneratePlanPayload {
  name: string;
  type: EventType;
  date: string;
  city: string;
  guests: number;
  totalBudget: number;
  currency?: string;
  durationHours?: number;
  language?: string;
  indoorOutdoor?: 'Indoor' | 'Outdoor' | 'Hybrid';
  theme?: string;
  culturalTradition?: string;
  foodPreference?: string;
  decorationStyle?: string;
  entertainmentPreference?: string;
  accessibilityRequirements?: string;
  topPriorities?: string[];
  userPrompt?: string;
}

export interface BudgetRescuePayload {
  totalBudget: number;
  currentExpenses: number;
  categories: BudgetCategory[];
  eventType: string;
  guests: number;
  city: string;
}

export interface BudgetRescueResponse {
  overspendAmount: number;
  isOverBudget: boolean;
  explanation: string;
  recommendations: Array<{
    category: string;
    currentAllocation: number;
    proposedAllocation: number;
    savings: number;
    action: string;
    tradeoff: string;
  }>;
  proposedCategories: BudgetCategory[];
}

export interface SimulateWhatIfPayload {
  totalBudget?: number;
  guests?: number;
  durationHours?: number;
  indoorOutdoor?: 'Indoor' | 'Outdoor' | 'Hybrid';
  venuePreference?: string;
  cateringPreference?: string;
}

export interface IdeasPayload {
  eventType: string;
  culturalTradition?: string;
  theme?: string;
  city: string;
  guests: number;
  totalBudget: number;
  foodPreference?: string;
  category?: string;
}

export const api = {
  // Generate structured event plan
  async generatePlan(data: GeneratePlanPayload, signal?: AbortSignal): Promise<EventPlan> {
    const response = await fetch(`${API_BASE_URL}/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to generate plan');
    }

    const json = await response.json();
    return json.data;
  },

  // AI Budget Rescue
  async rescueBudget(data: BudgetRescuePayload, signal?: AbortSignal): Promise<BudgetRescueResponse> {
    const response = await fetch(`${API_BASE_URL}/budget-rescue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to audit budget');
    }

    const json = await response.json();
    return json.data;
  },

  // What-If Simulator
  async simulateWhatIf(
    currentPlan: EventPlan,
    simulatedChanges: SimulateWhatIfPayload,
    signal?: AbortSignal
  ): Promise<WhatIfSimulationResult> {
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPlan, simulatedChanges }),
      signal
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
    eventContext: EventPlan,
    signal?: AbortSignal
  ): Promise<{ response: string; suggestedAction?: string }> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, eventContext }),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to communicate with AI Assistant');
    }

    const json = await response.json();
    return json.data;
  },

  // Dynamic ideas
  async getIdeas(params: IdeasPayload, signal?: AbortSignal): Promise<EventIdea[]> {
    const response = await fetch(`${API_BASE_URL}/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch ideas');
    }

    const json = await response.json();
    return json.data;
  },

  // Risk analysis
  async analyzeRisks(eventPlan: EventPlan, signal?: AbortSignal): Promise<EventRisk[]> {
    const response = await fetch(`${API_BASE_URL}/risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventPlan }),
      signal
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to analyze risks');
    }

    const json = await response.json();
    return json.data;
  }
};
