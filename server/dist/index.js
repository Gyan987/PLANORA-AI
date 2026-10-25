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
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
// AI Routes
app.use('/api/ai', aiRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred'
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
