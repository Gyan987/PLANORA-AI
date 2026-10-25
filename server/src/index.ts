import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Request, Response } from 'express';
import aiRoutes from './routes/aiRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

import { createRateLimiter } from './middleware/rateLimiter';

// Allowed CORS origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'https://planora-ai.netlify.app'
    ];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, tests) or if in development/test
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Planora AI Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// API Abuse Protection: 100 requests per 15 minutes per IP
const aiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'AI request limit reached. Please wait a few moments before submitting more planning requests.'
});

// AI Routes with rate limiting protection
app.use('/api/ai', aiRateLimiter, aiRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled server error:', err);
  }
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDev ? (err.message || 'An unexpected error occurred') : 'An unexpected error occurred. Please try again later.'
  });
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Planora AI Server running on http://localhost:${PORT}`);
    console.log(`✨ Gemini Integration: ${process.env.GEMINI_API_KEY ? 'Active (Official @google/genai SDK)' : 'Missing Key'}`);
    console.log(`====================================================`);
  });
}

export default app;
