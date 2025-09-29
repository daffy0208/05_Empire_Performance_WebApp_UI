import * as React from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry for error monitoring
export const initializeErrorMonitoring = () => {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || 'development';
  const release = import.meta.env.VITE_APP_VERSION || '1.0.0';

  if (sentryDsn && environment !== 'test') {
    Sentry.init({
      dsn: sentryDsn,
      environment,
      release,
      integrations: [
        new BrowserTracing({
          // Performance monitoring - using available instrumentation
          routingInstrumentation: undefined,
        }),
        // Capture console errors
        new Sentry.Integrations.Breadcrumbs({
          console: true,
          dom: true,
          fetch: true,
          history: true,
          sentry: true,
          xhr: true,
        }),
      ],
      // Performance monitoring sample rate
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Session replay sample rate
      replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5,
      replaysOnErrorSampleRate: 1.0,
      beforeSend: (event) => {
        // Filter out development errors
        if (environment === 'development') {
          console.warn('Sentry Event (Development):', event);
        }

        // Don't send events for known development issues
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }

        return event;
      },
      beforeBreadcrumb: (breadcrumb) => {
        // Filter sensitive data from breadcrumbs
        if (breadcrumb.category === 'xhr' || breadcrumb.category === 'fetch') {
          if (breadcrumb.data?.url?.includes('password') ||
              breadcrumb.data?.url?.includes('token')) {
            breadcrumb.data = { ...breadcrumb.data, url: '[Filtered]' };
          }
        }
        return breadcrumb;
      },
    });
  }
};

// Error boundary integration
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Custom error types
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  DATABASE = 'database',
  UI = 'ui',
  PERFORMANCE = 'performance',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  userRole?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

// Enhanced logging service
class LoggingService {
  private isProduction = import.meta.env.MODE === 'production';
  private isDevelopment = import.meta.env.MODE === 'development';

  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context) {
      return `${prefix} ${message} - Context: ${JSON.stringify(context, null, 2)}`;
    }

    return `${prefix} ${message}`;
  }

  // Console logging for development
  private consoleLog(level: 'log' | 'warn' | 'error', message: string, context?: any) {
    if (this.isDevelopment || !this.isProduction) {
      const formattedMessage = this.formatMessage(level, message, context);
      console[level](formattedMessage);
    }
  }

  // Structured logging for production
  private structuredLog(level: string, message: string, context?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // In production, you might want to send this to a logging service
    if (this.isProduction) {
      // Example: Send to external logging service
      // logService.send(logEntry);
    }

    return logEntry;
  }

  debug(message: string, context?: any) {
    this.consoleLog('log', message, context);
    this.structuredLog('debug', message, context);
  }

  info(message: string, context?: any) {
    this.consoleLog('log', message, context);
    this.structuredLog('info', message, context);

    // Add breadcrumb for Sentry
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data: context,
    });
  }

  warn(message: string, context?: any) {
    this.consoleLog('warn', message, context);
    this.structuredLog('warn', message, context);

    Sentry.addBreadcrumb({
      message,
      level: 'warning',
      data: context,
    });
  }

  error(message: string, error?: Error, context?: any) {
    this.consoleLog('error', message, { error: error?.message, stack: error?.stack, ...context });
    this.structuredLog('error', message, { error: error?.message, stack: error?.stack, ...context });

    // Report to Sentry
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setExtra(key, context[key]);
        });
      }

      if (error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(message, 'error');
      }
    });
  }
}

// Error handling utilities
export class AppError extends Error {
  public type: ErrorType;
  public severity: ErrorSeverity;
  public context?: ErrorContext;
  public timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date();

    // Preserve original error stack trace
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }

  endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      logger.warn(`Performance measurement '${name}' not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);

    // Log slow operations
    if (duration > 1000) { // More than 1 second
      logger.warn(`Slow operation detected: ${name}`, { duration: `${duration}ms` });

      // Report to Sentry
      Sentry.addBreadcrumb({
        message: `Slow operation: ${name}`,
        level: 'warning',
        data: { duration: `${duration}ms` },
        category: 'performance',
      });
    }

    return duration;
  }

  measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name);
    return asyncFn().finally(() => {
      this.endMeasurement(name);
    });
  }

  measureComponent(componentName: string) {
    return function<P extends {}>(Component: React.ComponentType<P>) {
      return function MeasuredComponent(props: P): React.ReactElement {
        React.useEffect(() => {
          const monitor = PerformanceMonitor.getInstance();
          monitor.startMeasurement(`${componentName}-render`);

          return () => {
            monitor.endMeasurement(`${componentName}-render`);
          };
        }, []);

        return React.createElement(Component, props);
      };
    };
  }
}

// API error handling
export const handleApiError = (error: any, context?: ErrorContext): AppError => {
  let errorType: ErrorType = ErrorType.UNKNOWN;
  let severity: ErrorSeverity = ErrorSeverity.MEDIUM;
  let message = 'An unexpected error occurred';

  if (error?.response) {
    // HTTP error response
    const status = error.response.status;
    message = error.response.data?.message || error.message || `HTTP ${status} Error`;

    if (status === 401) {
      errorType = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.HIGH;
    } else if (status === 403) {
      errorType = ErrorType.AUTHORIZATION;
      severity = ErrorSeverity.HIGH;
    } else if (status >= 400 && status < 500) {
      errorType = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
    } else if (status >= 500) {
      errorType = ErrorType.DATABASE;
      severity = ErrorSeverity.CRITICAL;
    }
  } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    errorType = ErrorType.NETWORK;
    severity = ErrorSeverity.HIGH;
    message = 'Network connection error. Please check your internet connection.';
  }

  const appError = new AppError(message, errorType, severity, context, error);
  logger.error(appError.message, error, context);

  return appError;
};

// User feedback integration
export const captureUserFeedback = (email: string, name: string, comments: string) => {
  Sentry.captureUserFeedback({
    email,
    name,
    comments,
  });
};

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new AppError(
      `Unhandled Promise Rejection: ${event.reason}`,
      ErrorType.UNKNOWN,
      ErrorSeverity.HIGH,
      { url: window.location.href }
    );
    logger.error(error.message, event.reason);
    event.preventDefault();
  });

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    const error = new AppError(
      `Unhandled Error: ${event.message}`,
      ErrorType.UNKNOWN,
      ErrorSeverity.HIGH,
      {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        url: window.location.href
      }
    );
    logger.error(error.message, event.error);
  });
};

// Export singleton instances
export const logger = new LoggingService();
export const performanceMonitor = PerformanceMonitor.getInstance();