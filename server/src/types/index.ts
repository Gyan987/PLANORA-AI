export type EventType =
  | 'wedding'
  | 'birthday'
  | 'community'
  | 'anniversary'
  | 'corporate'
  | 'custom';

export type VendorStatus =
  | 'Not Started'
  | 'Researching'
  | 'Shortlisted'
  | 'Contacted'
  | 'Negotiating'
  | 'Booked'
  | 'Completed';

export type PaymentStatus =
  | 'Unpaid'
  | 'Deposit Paid'
  | 'Partially Paid'
  | 'Paid in Full';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  actualAmount: number;
  percentage?: number;
  notes?: string;
  color?: string;
}

export interface ExpenseItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  amount: number;
  date: string;
  paid: boolean;
  notes?: string;
}

export interface PrepTask {
  id: string;
  title: string;
  category: string;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  notes?: string;
  dependencyTaskId?: string;
}

export interface DayScheduleItem {
  id: string;
  time: string;
  activity: string;
  location?: string;
  responsiblePerson?: string;
  notes?: string;
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  contactName?: string;
  phone?: string;
  email?: string;
  estimatedPrice: number;
  agreedPrice: number;
  paymentStatus: PaymentStatus;
  bookingStatus: VendorStatus;
  notes?: string;
  deadline?: string;
}

export interface EventIdea {
  id: string;
  title: string;
  category: string;
  description: string;
  estimatedCostRange: string;
  suitability: string;
  implementationTips: string[];
  saved?: boolean;
}

export interface EventRisk {
  id: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  recommendedAction: string;
  deadline: string;
}

export interface EventPlan {
  id: string;
  userId?: string;
  name: string;
  type: EventType;
  date: string;
  city: string;
  guests: number;
  totalBudget: number;
  currency: string;
  durationHours?: number;
  language?: string;
  indoorOutdoor: 'Indoor' | 'Outdoor' | 'Hybrid';
  theme?: string;
  culturalTradition?: string;
  foodPreference?: string;
  decorationStyle?: string;
  entertainmentPreference?: string;
  accessibilityRequirements?: string;
  topPriorities?: string[];
  userPrompt?: string;
  overviewSummary: string;
  budgetCategories: BudgetCategory[];
  expenses: ExpenseItem[];
  tasks: PrepTask[];
  daySchedule: DayScheduleItem[];
  vendors: VendorItem[];
  ideas: EventIdea[];
  risks: EventRisk[];
  contingencySuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'UPDATE_BUDGET' | 'ADD_TASK' | 'UPDATE_GUESTS' | 'ADD_VENDOR';
    payload: any;
    label: string;
  };
}

export interface WhatIfSimulationRequest {
  currentPlan: EventPlan;
  simulatedChanges: {
    totalBudget?: number;
    guests?: number;
    durationHours?: number;
    indoorOutdoor?: 'Indoor' | 'Outdoor' | 'Hybrid';
    venuePreference?: string;
    cateringPreference?: string;
  };
}

export interface WhatIfSimulationResult {
  summary: string;
  originalValues: {
    totalBudget: number;
    guests: number;
    costPerGuest: number;
    venueEstimate: number;
    cateringEstimate: number;
  };
  proposedValues: {
    totalBudget: number;
    guests: number;
    costPerGuest: number;
    venueEstimate: number;
    cateringEstimate: number;
  };
  budgetImpact: {
    difference: number;
    feasibility: 'Feasible' | 'Tight' | 'Deficit';
    details: string;
  };
  scheduleAndVendorImpacts: string[];
  tradeOffs: string[];
  actionableRecommendations: string[];
  proposedCategories: BudgetCategory[];
}
