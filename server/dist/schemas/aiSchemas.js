"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeasInputSchema = exports.RiskInputSchema = exports.WhatIfInputSchema = exports.ChatInputSchema = exports.BudgetRescueInputSchema = exports.EventCreationInputSchema = void 0;
const zod_1 = require("zod");
exports.EventCreationInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Event name must have at least 2 characters'),
    type: zod_1.z.enum(['wedding', 'birthday', 'community', 'anniversary', 'corporate', 'custom']),
    date: zod_1.z.string(),
    city: zod_1.z.string().min(2, 'City is required'),
    guests: zod_1.z.number().int().positive('Guest count must be positive'),
    totalBudget: zod_1.z.number().positive('Total budget must be positive'),
    currency: zod_1.z.string().default('INR'),
    durationHours: zod_1.z.number().optional().default(6),
    language: zod_1.z.string().optional().default('English'),
    indoorOutdoor: zod_1.z.enum(['Indoor', 'Outdoor', 'Hybrid']).default('Indoor'),
    theme: zod_1.z.string().optional(),
    culturalTradition: zod_1.z.string().optional(),
    foodPreference: zod_1.z.string().optional(),
    decorationStyle: zod_1.z.string().optional(),
    entertainmentPreference: zod_1.z.string().optional(),
    accessibilityRequirements: zod_1.z.string().optional(),
    topPriorities: zod_1.z.array(zod_1.z.string()).optional(),
    userPrompt: zod_1.z.string().optional()
});
exports.BudgetRescueInputSchema = zod_1.z.object({
    totalBudget: zod_1.z.number().positive(),
    currentExpenses: zod_1.z.number().nonnegative(),
    categories: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        allocatedAmount: zod_1.z.number(),
        actualAmount: zod_1.z.number()
    })),
    eventType: zod_1.z.string(),
    guests: zod_1.z.number(),
    city: zod_1.z.string()
});
exports.ChatInputSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message is required'),
    history: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant', 'system']),
        content: zod_1.z.string()
    })).optional().default([]),
    eventContext: zod_1.z.record(zod_1.z.any())
});
exports.WhatIfInputSchema = zod_1.z.object({
    currentPlan: zod_1.z.record(zod_1.z.any()),
    simulatedChanges: zod_1.z.object({
        totalBudget: zod_1.z.number().optional(),
        guests: zod_1.z.number().optional(),
        durationHours: zod_1.z.number().optional(),
        indoorOutdoor: zod_1.z.enum(['Indoor', 'Outdoor', 'Hybrid']).optional(),
        venuePreference: zod_1.z.string().optional(),
        cateringPreference: zod_1.z.string().optional()
    })
});
exports.RiskInputSchema = zod_1.z.object({
    eventPlan: zod_1.z.record(zod_1.z.any())
});
exports.IdeasInputSchema = zod_1.z.object({
    eventType: zod_1.z.string(),
    culturalTradition: zod_1.z.string().optional(),
    theme: zod_1.z.string().optional(),
    city: zod_1.z.string(),
    guests: zod_1.z.number(),
    totalBudget: zod_1.z.number(),
    foodPreference: zod_1.z.string().optional(),
    category: zod_1.z.string().optional()
});
