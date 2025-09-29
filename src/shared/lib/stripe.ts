import { loadStripe, Stripe } from '@stripe/stripe-js';

// This is your publishable key from Stripe Dashboard
// In production, this should come from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';

// Singleton instance to avoid re-loading Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Payment processing types
export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingZip: string;
}

export interface BookingPaymentData {
  amount: number;
  currency: string;
  description: string;
  metadata: {
    bookingId: string;
    coachId: string;
    playerId: string;
    sessionDate: string;
  };
}

// Stripe payment processing service
export class StripePaymentService {
  private stripe: Stripe | null = null;

  async initialize(): Promise<void> {
    this.stripe = await getStripe();
    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
  }

  async createPaymentMethod(paymentData: PaymentData): Promise<any> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentMethod } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: {
        number: paymentData.cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(paymentData.expiryDate.split('/')[0]),
        exp_year: parseInt('20' + paymentData.expiryDate.split('/')[1]),
        cvc: paymentData.cvv,
      },
      billing_details: {
        name: paymentData.cardholderName,
        address: {
          postal_code: paymentData.billingZip,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Payment method creation failed');
    }

    return paymentMethod;
  }

  async processPayment(bookingData: BookingPaymentData, paymentMethodId: string): Promise<any> {
    // This would typically call your backend API to create a payment intent
    // and confirm the payment server-side for security
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
        amount: bookingData.amount,
        currency: bookingData.currency,
        description: bookingData.description,
        metadata: bookingData.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment processing failed');
    }

    return response.json();
  }
}

// Utility functions for payment validation
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleanNumber);
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) return false;

  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const expYear = parseInt(year);
  const expMonth = parseInt(month);

  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;

  return true;
};

export const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};

export const getCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, '');

  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6/.test(number)) return 'Discover';

  return 'Unknown';
};

// Error handling utilities
export const formatStripeError = (error: any): string => {
  switch (error.code) {
    case 'card_declined':
      return 'Your card was declined. Please try a different payment method.';
    case 'expired_card':
      return 'Your card has expired. Please check the expiration date.';
    case 'incorrect_cvc':
      return 'Your card\'s security code is incorrect.';
    case 'processing_error':
      return 'An error occurred while processing your card. Please try again.';
    case 'rate_limit':
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};