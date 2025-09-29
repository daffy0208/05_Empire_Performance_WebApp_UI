"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:4028', 'http://localhost:5173'],
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// Body parser middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
app.use((0, morgan_1.default)('combined'));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});
// Stripe Payments API
app.post('/api/payments/create-intent', async (req, res) => {
    try {
        const { amount, currency, description, metadata } = req.body;
        // Validate required fields
        if (!amount || !currency) {
            return res.status(400).json({
                error: 'Missing required fields: amount and currency are required',
            });
        }
        // For now, return a mock response until Stripe is properly configured
        // In production, you would initialize Stripe with your secret key and create a real PaymentIntent
        const mockPaymentIntent = {
            clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
            id: `pi_mock_${Date.now()}`,
            amount,
            currency,
            description,
            metadata,
            status: 'requires_payment_method',
        };
        console.log('Payment Intent Created:', {
            amount,
            currency,
            description,
            metadata,
        });
        res.status(200).json({
            clientSecret: mockPaymentIntent.clientSecret,
            paymentIntent: mockPaymentIntent,
        });
    }
    catch (error) {
        console.error('Payment Intent Creation Error:', error);
        res.status(500).json({
            error: 'Failed to create payment intent',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Confirm payment endpoint
app.post('/api/payments/confirm', async (req, res) => {
    try {
        const { paymentIntentId, paymentMethodId } = req.body;
        if (!paymentIntentId) {
            return res.status(400).json({
                error: 'Missing required field: paymentIntentId',
            });
        }
        // Mock payment confirmation
        // In production, this would confirm the payment with Stripe
        const mockConfirmedPayment = {
            id: paymentIntentId,
            status: 'succeeded',
            amount_received: 10000, // Mock amount in cents
            currency: 'gbp',
            created: Math.floor(Date.now() / 1000),
            description: 'Empire Performance Coaching Session',
        };
        console.log('Payment Confirmed:', {
            paymentIntentId,
            paymentMethodId,
            status: 'succeeded',
        });
        res.status(200).json({
            paymentIntent: mockConfirmedPayment,
            success: true,
        });
    }
    catch (error) {
        console.error('Payment Confirmation Error:', error);
        res.status(500).json({
            error: 'Failed to confirm payment',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Legacy payment processing endpoint (for backward compatibility)
app.post('/api/payments/process', async (req, res) => {
    try {
        const { paymentMethodId, amount, currency, description, metadata } = req.body;
        if (!paymentMethodId || !amount || !currency) {
            return res.status(400).json({
                error: 'Missing required fields: paymentMethodId, amount, and currency are required',
            });
        }
        // Mock payment processing
        const mockProcessedPayment = {
            id: `pi_processed_${Date.now()}`,
            status: 'succeeded',
            amount,
            currency,
            description,
            metadata,
            payment_method: paymentMethodId,
        };
        console.log('Payment Processed:', {
            paymentMethodId,
            amount,
            currency,
            description,
            metadata,
        });
        res.status(200).json({
            paymentIntent: mockProcessedPayment,
            success: true,
        });
    }
    catch (error) {
        console.error('Payment Processing Error:', error);
        res.status(500).json({
            error: 'Failed to process payment',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Empire Performance Coaching API Server running on port ${PORT}`);
    console.log(`📡 Health check available at http://localhost:${PORT}/health`);
    console.log(`💳 Payments API available at http://localhost:${PORT}/api/payments/`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
