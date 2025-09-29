import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const PaymentStep = ({
  paymentDetails,
  onPaymentDetailsChange,
  bookingDetails,
  onNext,
  onPrevious
}) => {
  const selectedDate = bookingDetails?.date;
  const selectedCoach = bookingDetails?.coach;
  const playerData = bookingDetails?.player;
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingZip: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    const v = value?.replace(/\s+/g, '')?.replace(/[^0-9]/gi, '');
    const matches = v?.match(/\d{4,16}/g);
    const match = matches && matches?.[0] || '';
    const parts = [];
    for (let i = 0, len = match?.length; i < len; i += 4) {
      parts?.push(match?.substring(i, i + 4));
    }
    if (parts?.length) {
      return parts?.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value?.replace(/\s+/g, '')?.replace(/[^0-9]/gi, '');
    if (v?.length >= 2) {
      return v?.substring(0, 2) + '/' + v?.substring(2, 4);
    }
    return v;
  };

  const validatePaymentForm = () => {
    const newErrors = {};

    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    // Add required field validation
    if (!paymentData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!paymentData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!paymentData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!paymentData.billingZip) {
      newErrors.billingZip = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validatePaymentForm()) {
      // Save payment details and proceed to next step
      onPaymentDetailsChange(paymentData);
      onNext();
    }
  };

  // Calculate pricing - ensure we get the actual coach price
  const sessionPrice = selectedCoach?.pricePerSession || 75; // Default to £75 if no coach price
  const setupFee = 25;
  const subtotal = sessionPrice + setupFee;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const getCardType = (number) => {
    const num = number?.replace(/\s/g, '');
    if (/^4/?.test(num)) return 'Visa';
    if (/^5[1-5]/?.test(num)) return 'Mastercard';
    if (/^3[47]/?.test(num)) return 'American Express';
    if (/^6/?.test(num)) return 'Discover';
    return 'Card';
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
                Secured by 256-bit SSL encryption
              </span>
            </div>

            {/* Card Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4 flex items-center">
                <Icon name="CreditCard" size={20} className="mr-2 text-primary" />
                Payment Information
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="Card Number"
                    type="text"
                    value={paymentData?.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e?.target?.value))}
                    error={errors?.cardNumber}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                  {paymentData?.cardNumber && (
                    <div className="absolute right-3 top-8 text-sm font-medium text-[#CFCFCF]">
                      {getCardType(paymentData?.cardNumber)}
                    </div>
                  )}
                </div>

                <Input
                  label="Cardholder Name"
                  type="text"
                  value={paymentData?.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e?.target?.value)}
                  error={errors?.cardholderName}
                  placeholder="John Smith"
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Expiry Date"
                    type="text"
                    value={paymentData?.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e?.target?.value))}
                    error={errors?.expiryDate}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                  
                  <Input
                    label="CVV"
                    type="text"
                    value={paymentData?.cvv}
                    onChange={(e) => handleInputChange('cvv', e?.target?.value?.replace(/\D/g, ''))}
                    error={errors?.cvv}
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                  
                  <Input
                    label="ZIP Code"
                    type="text"
                    value={paymentData?.billingZip}
                    onChange={(e) => handleInputChange('billingZip', e?.target?.value)}
                    error={errors?.billingZip}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="border-t border-[#2A2A2E] pt-4">
                <Checkbox
                  label={`I agree to the Terms of Service and Privacy Policy`}
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e?.target?.checked)}
                  error={errors?.terms}
                  required
                />
              </div>

              <div className="bg-[#1A1A1D]/50 rounded-lg p-4">
                <h4 className="font-medium text-[#F5F5F5] mb-2">Important Notes:</h4>
                <ul className="text-sm text-[#CFCFCF] space-y-1">
                  <li>• Your card will be charged £{sessionPrice} for the first session</li>
                  <li>• Future sessions will be automatically charged 24 hours before each session</li>
                  <li>• You can cancel or reschedule up to 24 hours before any session</li>
                  <li>• No-shows will be charged the full session amount</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              fullWidth
              disabled={!acceptedTerms}
            >
              Complete Booking - £{total?.toFixed(2)}
            </Button>
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

              {/* Schedule */}
              <div className="flex items-center space-x-3">
                <Icon name="Repeat" size={16} className="text-primary" />
                <div>
                  <div className="text-sm font-medium text-[#F5F5F5]">Schedule</div>
                  <div className="text-sm text-[#CFCFCF]">
                    Weekly sessions
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-[#2A2A2E] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#CFCFCF]">Session fee</span>
                  <span className="text-[#F5F5F5]">£{sessionPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#CFCFCF]">Setup fee</span>
                  <span className="text-[#F5F5F5]">£{setupFee?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#CFCFCF]">Tax</span>
                  <span className="text-[#F5F5F5]">£{tax?.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#2A2A2E] pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#F5F5F5]">Total</span>
                    <span className="text-[#F5F5F5]">£{total?.toFixed(2)}</span>
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

export default PaymentStep;