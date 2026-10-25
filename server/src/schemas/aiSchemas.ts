import { z } from 'zod';

export const EventCreationInputSchema = z.object({
  name: z.string().min(2, 'Event name must have at least 2 characters'),
  type: z.enum(['wedding', 'birthday', 'community', 'anniversary', 'corporate', 'custom']),
  date: z.string(),
  city: z.string().min(2, 'City is required'),
  guests: z.number().int().positive('Guest count must be positive'),
  totalBudget: z.number().positive('Total budget must be positive'),
  currency: z.string().default('INR'),
  durationHours: z.number().optional().default(6),
  language: z.string().optional().default('English'),
  indoorOutdoor: z.enum(['Indoor', 'Outdoor', 'Hybrid']).default('Indoor'),
  theme: z.string().optional(),
  culturalTradition: z.string().optional(),
  foodPreference: z.string().optional(),
  decorationStyle: z.string().optional(),
  entertainmentPreference: z.string().optional(),
  accessibilityRequirements: z.string().optional(),
  topPriorities: z.array(z.string()).optional(),
  userPrompt: z.string().optional()
});

export const BudgetRescueInputSchema = z.object({
  totalBudget: z.number().positive(),
  currentExpenses: z.number().nonnegative(),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      allocatedAmount: z.number(),
      actualAmount: z.number()
    })
  ),
  eventType: z.string(),
  guests: z.number(),
  city: z.string()
});

export const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })
  ).optional().default([]),
  eventContext: z.record(z.any())
});

export const WhatIfInputSchema = z.object({
  currentPlan: z.record(z.any()),
  simulatedChanges: z.object({
    totalBudget: z.number().optional(),
    guests: z.number().optional(),
    durationHours: z.number().optional(),
    indoorOutdoor: z.enum(['Indoor', 'Outdoor', 'Hybrid']).optional(),
    venuePreference: z.string().optional(),
    cateringPreference: z.string().optional()
  })
});

export const RiskInputSchema = z.object({
  eventPlan: z.record(z.any())
});

export const IdeasInputSchema = z.object({
  eventType: z.string(),
  culturalTradition: z.string().optional(),
  theme: z.string().optional(),
  city: z.string(),
  guests: z.number(),
  totalBudget: z.number(),
  foodPreference: z.string().optional(),
  category: z.string().optional()
});
