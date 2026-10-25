"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AiController = void 0;
const aiSchemas_1 = require("../schemas/aiSchemas");
const geminiService_1 = require("../services/geminiService");
class AiController {
    // POST /api/ai/generate-plan
    async generatePlan(req, res) {
        try {
            const validation = aiSchemas_1.EventCreationInputSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors
                });
            }
            const plan = await geminiService_1.geminiService.generateCompletePlan(validation.data);
            return res.status(200).json({
                success: true,
                data: plan
            });
        }
        catch (error) {
            console.error('Error in generatePlan controller:', error);
            return res.status(500).json({
                error: 'Failed to generate event plan',
                message: error.message
            });
        }
    }
    // POST /api/ai/budget-rescue
    async budgetRescue(req, res) {
        try {
            const validation = aiSchemas_1.BudgetRescueInputSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors
                });
            }
            const rescueResult = await geminiService_1.geminiService.rescueBudget(validation.data);
            return res.status(200).json({
                success: true,
                data: rescueResult
            });
        }
        catch (error) {
            console.error('Error in budgetRescue controller:', error);
            return res.status(500).json({
                error: 'Failed to perform budget rescue',
                message: error.message
            });
        }
    }
    // POST /api/ai/simulate
    async simulateWhatIf(req, res) {
        try {
            const validation = aiSchemas_1.WhatIfInputSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors
                });
            }
            const result = await geminiService_1.geminiService.simulateWhatIf(validation.data.currentPlan, validation.data.simulatedChanges);
            return res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('Error in simulateWhatIf controller:', error);
            return res.status(500).json({
                error: 'Failed to simulate what-if scenario',
                message: error.message
            });
        }
    }
    // POST /api/ai/chat
    async chatAssistant(req, res) {
        try {
            const validation = aiSchemas_1.ChatInputSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors
                });
            }
            const { message, history, eventContext } = validation.data;
            const chatResponse = await geminiService_1.geminiService.chatWithAssistant(message, history, eventContext);
            return res.status(200).json({
                success: true,
                data: chatResponse
            });
        }
        catch (error) {
            console.error('Error in chatAssistant controller:', error);
            return res.status(500).json({
                error: 'Failed to get chat response',
                message: error.message
            });
        }
    }
    // POST /api/ai/ideas
    async getIdeas(req, res) {
        try {
            const validation = aiSchemas_1.IdeasInputSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors
                });
            }
            const ideas = await geminiService_1.geminiService.getPersonalizedIdeas(validation.data);
            return res.status(200).json({
                success: true,
                data: ideas
            });
        }
        catch (error) {
            console.error('Error in getIdeas controller:', error);
            return res.status(500).json({
                error: 'Failed to get personalized ideas',
                message: error.message
            });
        }
    }
    // POST /api/ai/risks
    async analyzeRisks(req, res) {
        try {
            const validation = aiSchemas_1.RiskInputSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.errors
                });
            }
            const risks = await geminiService_1.geminiService.analyzeRisks(validation.data.eventPlan);
            return res.status(200).json({
                success: true,
                data: risks
            });
        }
        catch (error) {
            console.error('Error in analyzeRisks controller:', error);
            return res.status(500).json({
                error: 'Failed to analyze risks',
                message: error.message
            });
        }
    }
}
exports.AiController = AiController;
exports.aiController = new AiController();
