"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 5000;
const rateLimiter_1 = require("./middleware/rateLimiter");
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, server-to-server, tests) or if in development/test
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
            callback(new Error('Blocked by CORS policy'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
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
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'Planora AI Backend',
        timestamp: new Date().toISOString(),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
    });
});
// API Abuse Protection: 100 requests per 15 minutes per IP
const aiRateLimiter = (0, rateLimiter_1.createRateLimiter)({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'AI request limit reached. Please wait a few moments before submitting more planning requests.'
});
// AI Routes with rate limiting protection
app.use('/api/ai', aiRateLimiter, aiRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error('Unhandled server error:', err);
    }
    const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: isDev ? (err.message || 'An unexpected error occurred') : 'An unexpected error occurred. Please try again later.'
    });
});
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Planora AI Server running on http://localhost:${PORT}`);
        console.log(`✨ Gemini Integration: ${process.env.GEMINI_API_KEY ? 'Active (Official @google/genai SDK)' : 'Missing Key'}`);
        console.log(`====================================================`);
    });
}
exports.default = app;
