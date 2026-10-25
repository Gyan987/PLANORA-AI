import type { Config } from '@netlify/functions';
import { aiController } from '../../server/src/controllers/aiController';

type Handler = (req: any, res: any) => Promise<unknown>;

const routes: Record<string, Handler> = {
  'generate-plan': (req, res) => aiController.generatePlan(req, res),
  'budget-rescue': (req, res) => aiController.budgetRescue(req, res),
  simulate: (req, res) => aiController.simulateWhatIf(req, res),
  chat: (req, res) => aiController.chatAssistant(req, res),
  ideas: (req, res) => aiController.getIdeas(req, res),
  risks: (req, res) => aiController.analyzeRisks(req, res)
};

// Adapts the Express-style controllers to the Web Request/Response API
export default async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const action = new URL(req.url).pathname.split('/').filter(Boolean).pop() || '';
  const handler = routes[action];
  if (!handler) {
    return Response.json({ error: 'Not Found' }, { status: 404 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let statusCode = 200;
  let payload: unknown = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      payload = data;
      return res;
    }
  };

  try {
    await handler({ body }, res);
  } catch (err: any) {
    console.error('Unhandled server error:', err);
    return Response.json(
      { error: 'Internal Server Error', message: err?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }

  return Response.json(payload, { status: statusCode });
};

export const config: Config = {
  path: '/api/ai/*'
};
