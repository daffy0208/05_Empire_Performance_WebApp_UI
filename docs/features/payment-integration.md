# Payment Integration - Empire Performance Coaching

## Overview

The payment system integrates Stripe for secure payment processing in the booking flow. This implementation includes:

- Secure card collection using Stripe Elements
- Payment intent creation and confirmation
- Comprehensive error handling
- PCI compliance through Stripe's secure infrastructure
- Real-time payment status updates

## Architecture

### Frontend Components

1. **PaymentStep.tsx** - Main payment form component
   - Integrates with Stripe Elements
   - Handles payment form validation
   - Manages payment processing state
   - Displays booking summary and pricing

2. **PaymentErrorBoundary.tsx** - Error handling wrapper
   - Catches payment-related errors
   - Provides user-friendly error messages
   - Includes retry functionality

### Backend Services

1. **stripe.ts** - Stripe configuration and utilities
   - Stripe instance management
   - Payment validation helpers
   - Error formatting utilities

2. **stripe-api.ts** - Payment processing API
   - Payment intent creation
   - Webhook handling
   - Database integration

### Database Schema

- **payment_intents** table for tracking payments
- **bookings** table updated with payment status
- RLS policies for data security
- Analytics views for payment reporting

## Security Features

### PCI Compliance
- Card data never touches our servers
- Stripe Elements for secure card collection
- Tokenization of payment methods
- Encrypted data transmission

### Data Protection
- Row Level Security (RLS) on payment tables
- Environment variable configuration
- Webhook signature verification
- Error logging without sensitive data

## Setup Instructions

### 1. Environment Configuration

Add to your `.env` file:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Database Setup

Run the SQL schema in Supabase:

```bash
psql -h your-db-host -U postgres -d postgres -f docs/database/payment_schema.sql
```

### 3. Stripe Dashboard Configuration

1. Create a Stripe account
2. Get your API keys from the dashboard
3. Configure webhooks pointing to `/api/payments/webhook`
4. Enable the following webhook events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 4. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Usage

### Basic Implementation

```tsx
import PaymentStep from './components/PaymentStep';

const BookingFlow = () => {
  const [paymentDetails, setPaymentDetails] = useState();

  return (
    <PaymentStep
      paymentDetails={paymentDetails}
      onPaymentDetailsChange={setPaymentDetails}
      bookingDetails={bookingData}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />
  );
};
```

### Error Handling

```tsx
import PaymentErrorBoundary from './components/PaymentErrorBoundary';

const App = () => (
  <PaymentErrorBoundary onRetry={handleRetry}>
    <PaymentStep {...props} />
  </PaymentErrorBoundary>
);
```

## Testing

### Unit Tests

Run the payment component tests:

```bash
npm test PaymentStep.test.tsx
```

### Integration Tests

Test the complete payment flow:

```bash
npm run test:e2e -- --grep "payment"
```

### Stripe Test Cards

Use these test cards for development:

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995

## Monitoring & Analytics

### Payment Analytics

Access payment analytics through the `payment_analytics` view:

```sql
SELECT * FROM payment_analytics
WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days';
```

### Error Monitoring

Payment errors are automatically reported to Sentry with:
- Payment intent IDs
- Error codes and messages
- User context (anonymized)
- Browser and device information

## Production Considerations

### Performance
- Stripe Elements are loaded asynchronously
- Payment intents are created early to reduce latency
- Database queries are optimized with indexes

### Scalability
- Webhook processing is idempotent
- Payment status updates use optimistic locking
- Failed payments have automatic retry logic

### Compliance
- PCI DSS compliance through Stripe
- GDPR compliance with data minimization
- SOC 2 Type II compliance

## Troubleshooting

### Common Issues

1. **Payment fails silently**
   - Check browser console for errors
   - Verify API keys are correct
   - Ensure webhook endpoints are accessible

2. **Card validation errors**
   - Check test card numbers
   - Verify expiry dates are in the future
   - Ensure CVC codes are valid

3. **Database connection issues**
   - Verify Supabase credentials
   - Check RLS policies
   - Ensure proper table permissions

### Debug Mode

Enable debug logging:

```bash
VITE_DEBUG_PAYMENTS=true npm start
```

## Future Enhancements

### Planned Features
- Subscription management
- Refund processing
- Multi-currency support
- Apple Pay / Google Pay integration
- Saved payment methods

### Performance Improvements
- Payment method caching
- Reduced API calls
- Optimistic UI updates
- Background payment status sync

## Support

For payment-related issues:
- Check Stripe dashboard for payment details
- Review application logs for errors
- Contact development team with payment intent IDs