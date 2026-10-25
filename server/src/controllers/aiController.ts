import { Request, Response } from 'express';
import {
  BudgetRescueInputSchema,
  ChatInputSchema,
  EventCreationInputSchema,
  IdeasInputSchema,
  RiskInputSchema,
  WhatIfInputSchema
} from '../schemas/aiSchemas';
import { geminiService } from '../services/geminiService';

export class AiController {
  // POST /api/ai/generate-plan
  async generatePlan(req: Request, res: Response) {
    try {
      const validation = EventCreationInputSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
      }

      const plan = await geminiService.generateCompletePlan(validation.data);
      return res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error: any) {
      console.error('Error in generatePlan controller:', error);
      return res.status(500).json({
        error: 'Failed to generate event plan',
        message: error.message
      });
    }
  }

  // POST /api/ai/budget-rescue
  async budgetRescue(req: Request, res: Response) {
    try {
      const validation = BudgetRescueInputSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
      }

      const rescueResult = await geminiService.rescueBudget(validation.data);
      return res.status(200).json({
        success: true,
        data: rescueResult
      });
    } catch (error: any) {
      console.error('Error in budgetRescue controller:', error);
      return res.status(500).json({
        error: 'Failed to perform budget rescue',
        message: error.message
      });
    }
  }

  // POST /api/ai/simulate
  async simulateWhatIf(req: Request, res: Response) {
    try {
      const validation = WhatIfInputSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
      }

      const result = await geminiService.simulateWhatIf(
        validation.data.currentPlan as any,
        validation.data.simulatedChanges
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in simulateWhatIf controller:', error);
      return res.status(500).json({
        error: 'Failed to simulate what-if scenario',
        message: error.message
      });
    }
  }

  // POST /api/ai/chat
  async chatAssistant(req: Request, res: Response) {
    try {
      const validation = ChatInputSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
      }

      const { message, history, eventContext } = validation.data;
      const chatResponse = await geminiService.chatWithAssistant(message, history, eventContext as any);
      return res.status(200).json({
        success: true,
        data: chatResponse
      });
    } catch (error: any) {
      console.error('Error in chatAssistant controller:', error);
      return res.status(500).json({
        error: 'Failed to get chat response',
        message: error.message
      });
    }
  }

  // POST /api/ai/ideas
  async getIdeas(req: Request, res: Response) {
    try {
      const validation = IdeasInputSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
      }

      const ideas = await geminiService.getPersonalizedIdeas(validation.data);
      return res.status(200).json({
        success: true,
        data: ideas
      });
    } catch (error: any) {
      console.error('Error in getIdeas controller:', error);
      return res.status(500).json({
        error: 'Failed to get personalized ideas',
        message: error.message
      });
    }
  }

  // POST /api/ai/risks
  async analyzeRisks(req: Request, res: Response) {
    try {
      const validation = RiskInputSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.errors
        });
      }

      const risks = await geminiService.analyzeRisks(validation.data.eventPlan as any);
      return res.status(200).json({
        success: true,
        data: risks
      });
    } catch (error: any) {
      console.error('Error in analyzeRisks controller:', error);
      return res.status(500).json({
        error: 'Failed to analyze risks',
        message: error.message
      });
    }
  }
}

export const aiController = new AiController();
