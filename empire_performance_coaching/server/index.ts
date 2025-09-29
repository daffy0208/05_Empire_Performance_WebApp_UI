import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet({
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
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4028', 'http://localhost:5173'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

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
    const mockId = `pi_3${Math.random().toString(36).substr(2, 20)}`;
    const mockSecret = Math.random().toString(36).substr(2, 24);
    const mockPaymentIntent = {
      clientSecret: `${mockId}_secret_${mockSecret}`,
      id: mockId,
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error('Payment Processing Error:', error);
    res.status(500).json({
      error: 'Failed to process payment',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;


