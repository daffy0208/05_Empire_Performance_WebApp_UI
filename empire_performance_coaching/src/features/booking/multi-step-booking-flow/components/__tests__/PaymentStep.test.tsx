import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PaymentStep from '../PaymentStep';

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    confirmCardPayment: vi.fn(() => Promise.resolve({
      paymentIntent: { status: 'succeeded' },
      error: null,
    })),
  })),
}));

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardElement: ({ onChange }: { onChange: (event: any) => void }) => (
    <div data-testid="card-element" onClick={() => onChange({ complete: true, error: null })}>
      Mock Card Element
    </div>
  ),
  useStripe: () => ({
    confirmCardPayment: vi.fn(() => Promise.resolve({
      paymentIntent: { status: 'succeeded' },
      error: null,
    })),
  }),
  useElements: () => ({
    getElement: vi.fn(() => ({})),
  }),
}));

// Mock fetch for payment intent creation
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      clientSecret: 'pi_test_client_secret',
    }),
  })
) as any;

const mockBookingDetails = {
  date: new Date('2025-01-15'),
  coach: {
    id: '1',
    name: 'John Coach',
    pricePerSession: 75,
  },
  player: {
    id: '1',
    playerName: 'John Player',
  },
};

const mockProps = {
  paymentDetails: undefined,
  onPaymentDetailsChange: vi.fn(),
  bookingDetails: mockBookingDetails,
  onNext: vi.fn(),
  onPrevious: vi.fn(),
};

describe('PaymentStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment form correctly', async () => {
    render(<PaymentStep {...mockProps} />);

    expect(screen.getByText('Secure Payment')).toBeInTheDocument();
    expect(screen.getByText('Payment Information')).toBeInTheDocument();
    expect(screen.getByText('Booking Summary')).toBeInTheDocument();
    expect(screen.getByTestId('card-element')).toBeInTheDocument();
  });

  it('displays booking summary correctly', async () => {
    render(<PaymentStep {...mockProps} />);

    expect(screen.getByText('John Coach')).toBeInTheDocument();
    expect(screen.getByText('John Player')).toBeInTheDocument();
    expect(screen.getByText('£75.00')).toBeInTheDocument(); // Session fee
    expect(screen.getByText('£25.00')).toBeInTheDocument(); // Setup fee
  });

  it('requires terms acceptance before payment', async () => {
    render(<PaymentStep {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /complete booking/i });
    expect(submitButton).toBeDisabled();

    const termsCheckbox = screen.getByLabelText(/terms of service/i);
    fireEvent.click(termsCheckbox);

    // Should still be disabled until card is complete
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is complete', async () => {
    render(<PaymentStep {...mockProps} />);

    // Accept terms
    const termsCheckbox = screen.getByLabelText(/terms of service/i);
    fireEvent.click(termsCheckbox);

    // Complete card element
    const cardElement = screen.getByTestId('card-element');
    fireEvent.click(cardElement);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /complete booking/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows loading state during payment processing', async () => {
    render(<PaymentStep {...mockProps} />);

    // Setup form
    const termsCheckbox = screen.getByLabelText(/terms of service/i);
    fireEvent.click(termsCheckbox);

    const cardElement = screen.getByTestId('card-element');
    fireEvent.click(cardElement);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /complete booking/i });
      fireEvent.click(submitButton);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('calls onNext when payment succeeds', async () => {
    render(<PaymentStep {...mockProps} />);

    // Setup and submit form
    const termsCheckbox = screen.getByLabelText(/terms of service/i);
    fireEvent.click(termsCheckbox);

    const cardElement = screen.getByTestId('card-element');
    fireEvent.click(cardElement);

    await waitFor(async () => {
      const submitButton = screen.getByRole('button', { name: /complete booking/i });
      fireEvent.click(submitButton);

      // Wait for payment processing
      await waitFor(() => {
        expect(mockProps.onNext).toHaveBeenCalled();
      });
    });
  });

  it('displays security badges and information', () => {
    render(<PaymentStep {...mockProps} />);

    expect(screen.getByText(/secured by stripe/i)).toBeInTheDocument();
    expect(screen.getByText(/256-bit ssl encryption/i)).toBeInTheDocument();
    expect(screen.getByText(/secure payment/i)).toBeInTheDocument();
    expect(screen.getByText(/never store your card details/i)).toBeInTheDocument();
  });

  it('calls onPrevious when back button is clicked', () => {
    render(<PaymentStep {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(mockProps.onPrevious).toHaveBeenCalled();
  });
});