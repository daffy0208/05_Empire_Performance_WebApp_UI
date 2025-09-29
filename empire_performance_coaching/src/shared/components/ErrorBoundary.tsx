import React, { ErrorInfo, ReactNode } from 'react';
import { logger, AppError, ErrorType, ErrorSeverity, captureUserFeedback } from '../lib/monitoring';
import Button from './ui/Button';
import Input from './ui/Input';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showFeedbackForm: boolean;
  feedbackData: {
    name: string;
    email: string;
    comments: string;
  };
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showFeedbackForm: false,
      feedbackData: {
        name: '',
        email: '',
        comments: ''
      }
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging
    const appError = new AppError(
      `React Error Boundary: ${error.message}`,
      ErrorType.UI,
      ErrorSeverity.HIGH,
      {
        component: errorInfo.componentStack,
        errorBoundary: 'ErrorBoundary',
        url: window.location.href
      },
      error
    );

    logger.error(appError.message, error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    });

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showFeedbackForm: false,
      feedbackData: { name: '', email: '', comments: '' }
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleFeedbackForm = () => {
    this.setState(prevState => ({
      showFeedbackForm: !prevState.showFeedbackForm
    }));
  };

  handleFeedbackChange = (field: keyof State['feedbackData']) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.setState(prevState => ({
      feedbackData: {
        ...prevState.feedbackData,
        [field]: e.target.value
      }
    }));
  };

  handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { feedbackData } = this.state;

    try {
      // Capture user feedback
      captureUserFeedback(
        feedbackData.email,
        feedbackData.name,
        feedbackData.comments
      );

      // Log feedback submission
      logger.info('User feedback submitted', {
        hasName: !!feedbackData.name,
        hasEmail: !!feedbackData.email,
        hasComments: !!feedbackData.comments
      });

      // Show success message
      alert('Thank you for your feedback! We will investigate this issue.');

      this.setState({
        showFeedbackForm: false,
        feedbackData: { name: '', email: '', comments: '' }
      });
    } catch (error) {
      logger.error('Failed to submit feedback', error as Error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, showFeedbackForm, feedbackData } = this.state;
      const isDevelopment = import.meta.env.MODE === 'development';

      return (
        <div className="min-h-screen bg-[#0E0E10] flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            {/* Error Icon and Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-[#CFCFCF] text-lg">
                We encountered an unexpected error. Don't worry, we're working to fix it.
              </p>
            </div>

            {/* Error Details (Development only) */}
            {isDevelopment && error && (
              <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-3">
                  Error Details (Development Mode)
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-[#CFCFCF] mb-1">Message:</h4>
                    <p className="text-sm text-red-400 font-mono">{error.message}</p>
                  </div>
                  {error.stack && (
                    <div>
                      <h4 className="text-sm font-medium text-[#CFCFCF] mb-1">Stack Trace:</h4>
                      <pre className="text-xs text-[#CFCFCF] bg-[#0E0E10] p-3 rounded overflow-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                className="min-w-[120px]"
                iconName="RefreshCw"
                iconPosition="left"
              >
                Try Again
              </Button>

              <Button
                onClick={this.handleReload}
                variant="secondary"
                className="min-w-[120px]"
                iconName="RefreshCw"
                iconPosition="left"
              >
                Reload Page
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="min-w-[120px]"
                iconName="Home"
                iconPosition="left"
              >
                Go Home
              </Button>

              <Button
                onClick={this.toggleFeedbackForm}
                variant="ghost"
                className="min-w-[120px]"
                iconName="MessageSquare"
                iconPosition="left"
              >
                Report Issue
              </Button>
            </div>

            {/* Feedback Form */}
            {showFeedbackForm && (
              <div className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">
                  Help us improve
                </h3>
                <p className="text-[#CFCFCF] text-sm mb-6">
                  Please provide details about what you were doing when this error occurred.
                  This helps us identify and fix the problem faster.
                </p>

                <form onSubmit={this.handleFeedbackSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="Your Name (optional)"
                      value={feedbackData.name}
                      onChange={this.handleFeedbackChange('name')}
                      placeholder="Enter your name"
                    />
                    <Input
                      type="email"
                      label="Your Email (optional)"
                      value={feedbackData.email}
                      onChange={this.handleFeedbackChange('email')}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-[#F5F5F5] mb-2">
                      What were you doing when this happened? *
                    </label>
                    <textarea
                      id="comments"
                      required
                      rows={4}
                      value={feedbackData.comments}
                      onChange={this.handleFeedbackChange('comments')}
                      placeholder="Describe what you were doing when the error occurred..."
                      className="w-full px-3 py-2 bg-[#0E0E10] border border-[#2A2A2E] rounded-md text-[#F5F5F5] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#C9A43B] focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" variant="primary">
                      Send Feedback
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={this.toggleFeedbackForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Help Text */}
            <div className="text-center mt-8">
              <p className="text-[#CFCFCF] text-sm">
                If this problem persists, please contact our support team at{' '}
                <a
                  href="mailto:support@empireperformance.com"
                  className="text-[#C9A43B] hover:underline"
                >
                  support@empireperformance.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;