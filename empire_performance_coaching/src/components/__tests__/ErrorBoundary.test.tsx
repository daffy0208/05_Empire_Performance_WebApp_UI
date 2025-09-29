import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { logger } from '../../lib/monitoring';

// Mock the monitoring library
vi.mock('../../lib/monitoring', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn()
  },
  AppError: class MockAppError extends Error {
    constructor(message, type, severity, context, originalError) {
      super(message);
      this.type = type;
      this.severity = severity;
      this.context = context;
      this.originalError = originalError;
    }
  },
  ErrorType: {
    UI: 'ui'
  },
  ErrorSeverity: {
    HIGH: 'high'
  },
  captureUserFeedback: vi.fn()
}));

// Mock alert for form submissions
global.alert = vi.fn();

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div data-testid="working-component">Component works!</div>;
};

// Component that throws an error after mounting
const DelayedError = ({ delay = 0 }) => {
  React.useEffect(() => {
    if (delay > 0) {
      setTimeout(() => {
        throw new Error('Delayed error');
      }, delay);
    }
  }, [delay]);

  return <div data-testid="delayed-component">Delayed component</div>;
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert.mockClear();
    // Mock window.location for navigation tests
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/test',
        reload: vi.fn()
      },
      writable: true
    });
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.getByText('Component works!')).toBeInTheDocument();
    });

    it('should not call error logging for successful renders', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('Error Catching and Logging', () => {
    it('should catch and display error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
    });

    it('should log error details when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Test error message" />
        </ErrorBoundary>
      );

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('React Error Boundary: Test error message'),
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
          errorBoundary: 'ErrorBoundary'
        })
      );
    });

    it('should call custom onError handler when provided', () => {
      const onErrorMock = vi.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError shouldThrow={true} errorMessage="Custom error" />
        </ErrorBoundary>
      );

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('Error Display and UI', () => {
    it('should show error details in development mode', () => {
      // Mock development mode
      vi.stubEnv('MODE', 'development');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Dev error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details (Development Mode)')).toBeInTheDocument();
      expect(screen.getByText('Message:')).toBeInTheDocument();
      expect(screen.getByText('Dev error message')).toBeInTheDocument();
    });

    it('should hide error details in production mode', () => {
      vi.stubEnv('MODE', 'production');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} errorMessage="Prod error message" />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Details (Development Mode)')).not.toBeInTheDocument();
      expect(screen.queryByText('Prod error message')).not.toBeInTheDocument();
    });

    it('should display action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /report issue/i })).toBeInTheDocument();
    });
  });

  describe('Error Recovery Actions', () => {
    it('should reset error state when Try Again is clicked', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify error is displayed
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // Click Try Again
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Rerender with working component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show working component
      await waitFor(() => {
        expect(screen.getByTestId('working-component')).toBeInTheDocument();
      });
    });

    it('should reload page when Reload Page is clicked', () => {
      const reloadSpy = vi.spyOn(window.location, 'reload');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /reload page/i }));

      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should navigate home when Go Home is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /go home/i }));

      expect(window.location.href).toBe('/');
    });
  });

  describe('User Feedback System', () => {
    it('should show feedback form when Report Issue is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /report issue/i }));

      expect(screen.getByText('Help us improve')).toBeInTheDocument();
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/what were you doing/i)).toBeInTheDocument();
    });

    it('should hide feedback form when Cancel is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Show feedback form
      fireEvent.click(screen.getByRole('button', { name: /report issue/i }));
      expect(screen.getByText('Help us improve')).toBeInTheDocument();

      // Hide feedback form
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByText('Help us improve')).not.toBeInTheDocument();
    });

    it('should handle feedback form submission', async () => {
      const { captureUserFeedback } = await import('../../lib/monitoring');

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Open feedback form
      fireEvent.click(screen.getByRole('button', { name: /report issue/i }));

      // Fill form
      fireEvent.change(screen.getByLabelText(/your name/i), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText(/your email/i), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/what were you doing/i), {
        target: { value: 'Testing the application' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /send feedback/i }));

      await waitFor(() => {
        expect(captureUserFeedback).toHaveBeenCalledWith(
          'john@example.com',
          'John Doe',
          'Testing the application'
        );
      });

      expect(global.alert).toHaveBeenCalledWith(
        'Thank you for your feedback! We will investigate this issue.'
      );
    });

    it('should require comments field in feedback form', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /report issue/i }));

      const commentsField = screen.getByLabelText(/what were you doing/i);
      expect(commentsField).toBeRequired();
    });

    it('should handle feedback submission errors', async () => {
      const { captureUserFeedback } = await import('../../lib/monitoring');
      captureUserFeedback.mockImplementation(() => {
        throw new Error('Feedback submission failed');
      });

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Open and fill feedback form
      fireEvent.click(screen.getByRole('button', { name: /report issue/i }));
      fireEvent.change(screen.getByLabelText(/what were you doing/i), {
        target: { value: 'Testing error handling' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /send feedback/i }));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Failed to submit feedback. Please try again.'
        );
      });
    });
  });

  describe('Custom Fallback UI', () => {
    it('should render custom fallback when provided', () => {
      const CustomFallback = () => (
        <div data-testid="custom-fallback">Custom Error UI</div>
      );

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });

    it('should not render default error UI when custom fallback is provided', () => {
      const CustomFallback = () => (
        <div data-testid="custom-fallback">Custom Error UI</div>
      );

      render(
        <ErrorBoundary fallback={<CustomFallback />}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Error Scenarios', () => {
    it('should handle errors from different components', () => {
      render(
        <ErrorBoundary>
          <div>
            <ThrowError shouldThrow={true} errorMessage="Component A error" />
            <ThrowError shouldThrow={false} />
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Component A error'),
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should handle async errors', async () => {
      const AsyncErrorComponent = () => {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error('Async error');
          }, 100);
        }, []);

        return <div>Async component</div>;
      };

      // Note: React Error Boundaries don't catch async errors by default
      // This test documents the current limitation
      render(
        <ErrorBoundary>
          <AsyncErrorComponent />
        </ErrorBoundary>
      );

      // Should render normally since async errors aren't caught
      expect(screen.getByText('Async component')).toBeInTheDocument();

      // Wait to ensure async error doesn't crash the boundary
      await waitFor(() => {
        expect(screen.getByText('Async component')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('State Management', () => {
    it('should maintain error state until reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // Rerender with working component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should still show error until explicitly reset
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('should clear error state on retry', () => {
      const TestWrapper = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);

        return (
          <div>
            <button onClick={() => setShouldThrow(false)}>Fix Component</button>
            <ErrorBoundary>
              <ThrowError shouldThrow={shouldThrow} />
            </ErrorBoundary>
          </div>
        );
      };

      render(<TestWrapper />);

      // Initially shows error
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // Click Try Again
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));

      // Fix the component
      fireEvent.click(screen.getByText('Fix Component'));

      // Should show working component
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide accessible error interface', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check for proper headings
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // Check for accessible buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });

      // Check for form accessibility when feedback form is shown
      fireEvent.click(screen.getByRole('button', { name: /report issue/i }));

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Check form labels
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/what were you doing/i)).toBeInTheDocument();
    });
  });
});