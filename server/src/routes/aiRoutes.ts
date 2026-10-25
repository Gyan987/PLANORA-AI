import { Router } from 'express';
import { aiController } from '../controllers/aiController';

const router = Router();

router.post('/generate-plan', (req, res) => aiController.generatePlan(req, res));
router.post('/budget-rescue', (req, res) => aiController.budgetRescue(req, res));
router.post('/simulate', (req, res) => aiController.simulateWhatIf(req, res));
router.post('/chat', (req, res) => aiController.chatAssistant(req, res));
router.post('/ideas', (req, res) => aiController.getIdeas(req, res));
router.post('/risks', (req, res) => aiController.analyzeRisks(req, res));

export default router;
