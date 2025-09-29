import React, { Component, ReactNode } from 'react';
import Icon from '../../empire_performance_coaching/src/features/components/AppIcon';
import Button from '../../empire_performance_coaching/src/features/components/ui/Button';

interface PaymentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface PaymentErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

class PaymentErrorBoundary extends Component<PaymentErrorBoundaryProps, PaymentErrorBoundaryState> {
  constructor(props: PaymentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): PaymentErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Payment Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Report to monitoring service
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: 'PaymentErrorBoundary',
        },
        extra: errorInfo,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="bg-red-500/10 border border-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertTriangle" size={32} className="text-red-500" />
            </div>

            <h2 className="text-xl font-semibold text-[#F5F5F5] mb-2">
              Payment System Error
            </h2>

            <p className="text-[#CFCFCF] mb-6">
              We encountered an issue with the payment system. Your card has not been charged.
            </p>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                variant="default"
                size="lg"
                fullWidth
              >
                Try Again
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                fullWidth
              >
                Refresh Page
              </Button>
            </div>

            <div className="mt-6 p-4 bg-[#1A1A1D]/50 rounded-lg">
              <h3 className="text-sm font-medium text-[#F5F5F5] mb-2">Need Help?</h3>
              <p className="text-xs text-[#CFCFCF] mb-2">
                If this issue persists, please contact our support team:
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <a
                  href="mailto:support@empireperformance.com"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  support@empireperformance.com
                </a>
                <span className="text-[#CFCFCF]">•</span>
                <a
                  href="tel:+441234567890"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  +44 123 456 7890
                </a>
              </div>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm font-medium text-[#CFCFCF] cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-[#1A1A1D] rounded text-xs text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentErrorBoundary;