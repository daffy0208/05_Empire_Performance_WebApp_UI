import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Icon from '../../../../shared/components/AppIcon';
import Input from '../../../../shared/components/ui/Input';
import { Checkbox } from '../../../../shared/components/ui/Checkbox';
import Button from '../../../../shared/components/ui/Button';
import { getStripe, StripePaymentService, validateCardNumber, validateExpiryDate, validateCVV, getCardType, formatStripeError, type PaymentData, type BookingPaymentData } from '../../../../shared/lib/stripe';

interface BookingDetails {
  date: Date;
  coach: {
    id: string;
    name: string;
    pricePerSession: number;
  };
  player: {
    playerName: string;
    id?: string;
  };
  location?: any;
}

interface PaymentStepProps {
  paymentDetails?: PaymentData;
  onPaymentDetailsChange: (data: PaymentData) => void;
  bookingDetails: BookingDetails;
  onNext: () => void;
  onPrevious: () => void;
}

// Stripe Card Element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#F5F5F5',
      backgroundColor: '#1A1A1D',
      '::placeholder': {
        color: '#CFCFCF',
      },
      iconColor: '#CFCFCF',
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
  hidePostalCode: false,
};

const PaymentForm: React.FC<PaymentStepProps> = ({
  paymentDetails,
  onPaymentDetailsChange,
  bookingDetails,
  onNext,
  onPrevious
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  const selectedDate = bookingDetails?.date;
  const selectedCoach = bookingDetails?.coach;
  const playerData = bookingDetails?.player;

  // Calculate pricing
  const sessionPrice = selectedCoach?.pricePerSession || 75;
  const setupFee = 25;
  const subtotal = sessionPrice + setupFee;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [total]);

  const createPaymentIntent = async () => {
    try {
      // For development/demo mode - create a properly formatted mock client secret
      // In production, this would call your backend API
      const mockId = `pi_3${Math.random().toString(36).substr(2, 20)}`;
      const mockSecret = Math.random().toString(36).substr(2, 24);
      const mockClientSecret = `${mockId}_secret_${mockSecret}`;

      console.log('Demo mode: Using mock PaymentIntent', {
        amount: Math.round(total * 100),
        currency: 'gbp',
        description: `Empire Performance Coaching Session - ${selectedCoach?.name}`,
        mockClientSecret
      });

      setPaymentIntent(mockClientSecret);
      console.log('PaymentIntent set to:', mockClientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setErrors({ payment: 'Failed to initialize payment. Please refresh and try again.' });
    }
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);

    if (event.error) {
      setErrors({ card: event.error.message });
    } else {
      setErrors(prev => ({ ...prev, card: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    if (!cardComplete) {
      newErrors.card = 'Please complete your card information';
    }

    if (!paymentIntent) {
      newErrors.payment = 'Payment not initialized. Please refresh the page.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !stripe || !elements || processing) {
      return;
    }

    setProcessing(true);
    setErrors({});

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment with Stripe
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(paymentIntent, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: playerData?.playerName || 'Customer',
          },
        },
      });

      if (error) {
        setErrors({ payment: formatStripeError(error) });
        return;
      }

      if (confirmedPayment?.status === 'succeeded') {
        // Payment successful - save payment details and proceed
        const paymentData: PaymentData = {
          cardNumber: '•••• •••• •••• ••••', // Don't store actual card numbers
          expiryDate: '',
          cvv: '',
          cardholderName: playerData?.playerName || 'Customer',
          billingZip: '',
        };

        onPaymentDetailsChange(paymentData);
        onNext();
      } else {
        setErrors({ payment: 'Payment was not completed. Please try again.' });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrors({ payment: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">
          Secure Payment
        </h2>
        <p className="text-[#CFCFCF]">
          Complete your booking with secure payment processing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] rounded-xl border border-[#2A2A2E] p-6 shadow-elevation-1 space-y-6">
            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 p-3 bg-success/10 border border-success/20 rounded-lg">
              <Icon name="Shield" size={20} className="text-success" />
              <span className="text-sm font-medium text-success">
                Secured by Stripe with 256-bit SSL encryption
              </span>
            </div>

            {/* Card Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center">
                <Icon name="CreditCard" size={20} className="mr-2 text-primary" />
                Payment Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F5F5F5] mb-2">
                    Card Details
                  </label>
                  <div className="border border-[#2A2A2E] rounded-lg p-4 bg-[#1A1A1D] focus-within:border-primary">
                    <CardElement
                      options={cardElementOptions}
                      onChange={handleCardChange}
                    />
                  </div>
                  {errors.card && (
                    <p className="mt-1 text-sm text-red-500">{errors.card}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Errors */}
            {errors.payment && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-red-500" />
                  <span className="text-sm text-red-500">{errors.payment}</span>
                </div>
              </div>
            )}

            {/* Debug Info - Remove this in production */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-sm text-blue-400">
                <div><strong>Debug Info:</strong></div>
                <div>✓ Terms Accepted: <strong>{acceptedTerms ? 'YES' : 'NO'}</strong></div>
                <div>✓ Card Complete: <strong>{cardComplete ? 'YES' : 'NO'}</strong></div>
                <div>✓ Payment Intent: <strong>{paymentIntent ? 'YES' : 'NO'}</strong></div>
                <div>✓ Processing: <strong>{processing ? 'YES (DISABLED)' : 'NO'}</strong></div>
                <div>Button Should Be: <strong>{(!acceptedTerms || !cardComplete || !paymentIntent || processing) ? 'DISABLED' : 'ENABLED'}</strong></div>
                <div>Button Force Enabled: <strong>YES (disabled=false, loading=false)</strong></div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="border-t border-[#2A2A2E] pt-4">
                <Checkbox
                  label="I agree to the Terms of Service and Privacy Policy"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  error={errors.terms}
                  required
                />
              </div>

              <div className="bg-[#1A1A1D]/50 rounded-lg p-4">
                <h4 className="font-medium text-[#F5F5F5] mb-2">Important Notes:</h4>
                <ul className="text-sm text-[#CFCFCF] space-y-1">
                  <li>• Your card will be charged £{sessionPrice.toFixed(2)} for the first session</li>
                  <li>• Future sessions will be automatically charged 24 hours before each session</li>
                  <li>• You can cancel or reschedule up to 24 hours before any session</li>
                  <li>• No-shows will be charged the full session amount</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onPrevious}
                disabled={processing}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={false}
                loading={false}
                className="flex-2"
                onClick={() => {
                  console.log('Button clicked! State:', {
                    acceptedTerms,
                    cardComplete,
                    paymentIntent: !!paymentIntent,
                    processing,
                    originalDisabled: !acceptedTerms || !cardComplete || !paymentIntent || processing
                  });
                }}
              >
                {processing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Complete Booking - £${total.toFixed(2)}`
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#1A1A1D] to-[#141416] rounded-xl border border-[#2A2A2E] p-6 shadow-elevation-1 sticky top-4">
            <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">
              Booking Summary
            </h3>

            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-center space-x-3">
                <Icon name="Calendar" size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-[#F5F5F5]">Training Date</div>
                  <div className="text-sm text-[#CFCFCF]">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Coach */}
              <div className="flex items-center space-x-3">
                <Icon name="User" size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-[#F5F5F5]">Coach</div>
                  <div className="text-sm text-[#CFCFCF]">{selectedCoach?.name}</div>
                </div>
              </div>

              {/* Player */}
              <div className="flex items-center space-x-3">
                <Icon name="UserCheck" size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-[#F5F5F5]">Player</div>
                  <div className="text-sm text-[#CFCFCF]">
                    {playerData?.playerName || 'Player information'}
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-[#2A2A2E] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#CFCFCF]">Session fee</span>
                  <span className="text-[#F5F5F5]">£{sessionPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#CFCFCF]">Setup fee</span>
                  <span className="text-[#F5F5F5]">£{setupFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#CFCFCF]">Tax</span>
                  <span className="text-[#F5F5F5]">£{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#2A2A2E] pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#F5F5F5]">Total</span>
                    <span className="text-[#F5F5F5]">£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Security */}
              <div className="bg-[#1A1A1D]/50 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Lock" size={14} className="text-success" />
                  <span className="text-sm font-medium text-success">Secure Payment</span>
                </div>
                <p className="text-xs text-[#CFCFCF]">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component that wraps PaymentForm with Stripe Elements
const PaymentStep: React.FC<PaymentStepProps> = (props) => {
  const [stripePromise] = useState(() => getStripe());

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentStep;